import { getCurrentScope, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { PropType, Reactive } from 'vue'
import type { LocationQuery } from 'vue-router'

/* ===== EXPORTED TYPES ===================================================== */

/** Types accepted by our reactive object */
export type ZQueryReactiveValue = string | number | boolean

/** A record representing a basic/untyped reactive object */
export type ZQueryReactiveObject = Record<string, ZQueryReactiveValue | undefined>

/** Default for T: either a primitive or a function producing one */
export type ZQueryReactiveDefault<T extends ZQueryReactiveValue> = T | undefined |
  ((state: Readonly<ZQueryReactiveObject>) => T | undefined)

/** Simple definition for a reactive property */
export type ZQueryReactiveDef<T extends ZQueryReactiveValue = ZQueryReactiveValue> =
  { type: PropType<T>, default?: ZQueryReactiveDefault<T>, useRoute?: boolean } |
  ( PropType<T> & { type?: never, default?: never, useRoute?: never } )

/**
 * Definition for a reactive object that can be bound to the router query.
 *
 * Each key in the definition object represents a property in the reactive
 * object and the key in the query string.
 *
 * Types can be simple strings, numbers, or booleans (for more complex types
 * use `PropType`, but _no validation occurs_, so be careful).
 *
 * The `default` property is used when the query string is missing or empty,
 * and for booleans it's always `false` (to avoid the "undefined" state).
 */
export type ZQueryReactiveDefs = { [ K: string ]: ZQueryReactiveDef }

/* ===== INTERNAL TYPES ===================================================== */

/** Internal definition (basically the object version of ReactiveDef) */
type InternalDef = {
  type: PropType<ZQueryReactiveValue>,
  default: ZQueryReactiveDefault<ZQueryReactiveValue>,
  useRoute: boolean,
}

/** Infer a single definition */
type InferDef<T extends ZQueryReactiveDef> =
  T extends { type: PropType<infer R> } ? // / is this a "typed" definition???
    //
    R extends boolean ? boolean : //         / if it's a boolean, return a boolean
    //
      T['default'] extends () => infer X ? //  / if default is a function infer the return type
        undefined extends X ?
        R | undefined : //                   / if the return type can be undefined
          R : //                               / then the value can be undefined too
        undefined extends T['default'] ?
        R | undefined : //                   / the same for when the default is a value
          R : //                               / if default can be undefined, then...
  //
    T extends PropType<infer R> ? //           / this is not a "typed" definition
      R extends boolean ? boolean : //         / if it's a boolean, return a boolean
      R | undefined : //                     / otherwise, return the type or undefined
    //
      never //                                   / not accepting anything else

/** Infer all our definitions */
type InferDefs<T extends ZQueryReactiveDefs> = {
  [ K in keyof T ]:
  T[K]['type'] extends PropType<any> ? InferDef<T[K]> : // typed definition
    T[K] extends PropType<any> ? InferDef<T[K]> : //      // simple constructor
      never //                                              // nothing else!
}

/* ===== INTERNAL FUNCTIONS ================================================= */

/** Get the default value from a ReactiveDef */
function getDefaultValueFor<T extends ZQueryReactiveValue>(
    def: ZQueryReactiveDef<T>,
    state: ZQueryReactiveObject,
): T | undefined {
  const value = typeof def.default === 'function' ?
      def.default({ ...state }) :
      def.default
  if (def.type === Boolean) return (value || false) as T
  return value as T
}

/* ===== EXPORTED FUNCTIONS ================================================= */

/**
 * Create a reactive object following the given definition and _optionally_ bind
 * it to the router's query string.
 *
 * @param definition - The definition for the reactive object.
 * @param useRoutes - When true, bind the object to the router's query string.
 */
export function createBoundObject<T extends ZQueryReactiveDefs>(
    definition: T,
    useRoutes: boolean = false,
): Reactive<InferDefs<T>> {
  // triple check that we're not doing something stupid
  if (! getCurrentScope()) throw new Error('No reacive scope found')

  // start with an empty object, we'll fill it with the default values
  const object = reactive({} as Record<string, any>)

  // clone our definitions (we'll clean them up)
  const defs: Record<string, InternalDef> = {}

  // clone and normalize our definitions while setting up the default values
  for (const [ key, def ] of Object.entries(definition)) {
    object[key] = getDefaultValueFor(def, object)

    // check, normalize and store the definition
    const type: PropType<ZQueryReactiveValue> = def.type || def
    const useRoute = def.useRoute === false ? false : useRoutes

    // if it's a good type (String, Number, Boolean), we're good to go
    if ((type === String) || (type === Number) || (type === Boolean)) {
      defs[key] = { type, useRoute, default: def.default }
      continue
    }

    // wrong type, throw an error
    throw new Error(`Invalid constructor definition "${key}": ${type}`)
  }

  // if we're not binding to the router query, we're done!
  if (! useRoutes) return object as Reactive<InferDefs<T>>

  // we're binding to the query, get our router!
  const router = useRouter()

  // --- ROUTE to OBJECT -------------------------------------------------------

  watch(() => router.currentRoute.value.query, (query) => {
    for (const [ key, def ] of Object.entries(defs)) {
      if (! def.useRoute) continue // skip anyhting not bound to the route

      // get our default value for the current defintion
      const defaultValue = getDefaultValueFor(defs[key]!, object)

      // normalize query value to a simple string / null / undefined
      const string = (Array.isArray(query[key]) ? query[key][0] : query[key])

      // empty strings, nulls, undefined will be mapped to defaults
      if (def.type === String) {
        const value = string || defaultValue
        if (object[key] !== value) object[key] = value
        continue
      }

      // numbers will be parsed *if* there is a value (a string longer than zero
      // and "NaN"s will be mapped to the default value (basically, ignored)
      if (def.type === Number) {
        let value = string ? Number(string) : defaultValue
        if ((typeof value !== 'number') || isNaN(value)) value = defaultValue
        if (object[key] !== value) object[key] = value
        continue
      }

      // booleans are represented (normally) with a single 't' or 'f', but
      // we also accept the shorter '?value&' in the query and the router
      // represents this value with "null" (not "undefined")
      if (def.type === Boolean) {
        const value = string === null ? true : //     "?value&"
                      string === 'true' ? true : //   "?value=t&"
                      string === 't' ? true : //      "?value=true&"
                      string === 'false' ? false : // "?value=f&"
                      string === 'f' ? false : //     "?value=false&"
                      (defaultValue || false) // anything else is default
        if (object[key] !== value) object[key] = value
        continue
      }
    }
  }, { immediate: true })

  // watch for changes in our object and update the route query
  watch(object, (object) => {
    // get the *current* query (we'll retain extra parameters)
    const query: LocationQuery = { ...router.currentRoute.value.query }
    let modified = false

    // update the query with values from our object
    for (const [ key, def ] of Object.entries(defs)) {
      if (! def.useRoute) continue // skip anyhting not bound to the route

      // get the default value for the current definition
      const defaultValue = getDefaultValueFor(defs[key]!, object)

      // this is what we'll be pushing to (or pulling from) the query
      let value: string | null | undefined

      // strings or numbers are converted to strings, empty strings, nulls and
      // undefineds are omitted, and the default value is also omitted
      if ((def.type === String) || (def.type === Number)) {
        value = object[key] === defaultValue ? undefined : // default values are omitted
                object[key] === '' ? undefined : // empty strings (but not zeroes!!!) are omitted
                object[key] === undefined ? undefined : // undefineds are omitted
                object[key] === null ? undefined : // nulls are omitted
                String(object[key]) // everything else is converted to string
      } else if (def.type === Boolean) {
        value = object[key] === defaultValue ? undefined : // default values are omitted
                object[key] ? null : 'f' // true is "null" (short form), false is "f"
      }

      // if the value is *exactly* the same as the query, we can skip
      if (value === query[key]) continue

      // delete or replace/add the query value and mark for modifications
      if (value === undefined) delete query[key]
      else query[key] = value
      modified = true
    }

    // replace the query in the router if we modified anything
    if (modified) router.replace({ query })
  }, { immediate: true })

  // done!
  return object as Reactive<InferDefs<T>>
}

// ===== TABLE STATE ===========================================================

/** Table state definition */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const tableStateDefs = () => ({

  // remember, "q" needs to go _before_ "sort" and "desc" by default, so that
  // its value from the query can be used to set/reset the sort and order

  /** The optional free-text search to send alongside our query */
  q: { type: String, default: '', isFilter: true },

  // sort and desc go *after* q, so that q can affect their value

  /** The column to sort results on */
  sort: { type: String, isFilter: true, default: undefined as ZQueryReactiveDefault<string> },
  /** The order for sorting (`true` for descending) */
  desc: { type: Boolean, isFilter: true, default: undefined as ZQueryReactiveDefault<boolean> },

  // the rest of the properties can be in any order

  /** A flag indicating if deleted records should be included in the response */
  deleted: { type: Boolean, default: false, isFilter: true },
  /** The offset of the first result to return */
  offset: { type: Number, default: 0 },
  /** The maximum number of results to return */
  limit: { type: Number, default: 1 },
  /** The current reload count */
  reload: { type: Number, default: 0, useRoute: false },

} satisfies { [ k: string ]: ZQueryReactiveDef & { isFilter?: boolean } })

/** Type from our `tableStateDefs` function above */
type TableStateDefs = ReturnType<typeof tableStateDefs>

/**
 * Create a reactive `TableState` optionally bound to the router's query.
 *
 * Because of the way `q` (text search) interacts with sorting, the object
 * returned will _always_ expose a `q` property, and will reset the `sort`
 * and `desc` values to `undefined` and `false` (respectively) when `q` is
 * set, to their respective defaults when it's empty.
 *
 * To preserve a specific ordering via `sort` and `desc` even when `q` is
 * set, you can override the default values by providing an _extra_ definition
 * for `sort` and/or `desc` when creating the bound table state.
 *
 * The `reload` property is a reactive number that can be used to force a
 * reload of the table data (just increment it!).
 *
 * The options object can include the following:
 * * `length` - the number of results to show per page
 * * `sort` - the _initial_ sort column
 * * `desc` - the _initial_ descending sort order
 * * `extra` - additional properties to include in the object
 * * `useRoute` - whether to bind the object to the router query
 */
export function createBoundTableState<T extends {
  [ k: string ]: ZQueryReactiveDef & { isFilter?: boolean } // add "isFilter"
} = {}>(options: {
  length: number,
  sort?: string,
  desc?: boolean,
  extra?: T,
  useRoute?: boolean,
}): Reactive<InferDefs<T & TableStateDefs>> {
  const { length, sort, desc = false, extra = {}, useRoute = false } = options

  // definitions from basic above and include any extra properties
  const defs = { ...tableStateDefs(), ...extra }
  // adjust limit, if length is sensible...
  if (length > 0) defs.limit.default = length + 1

  // infer the default sort if not overridden in extra... this basically tells
  // us to sort by the default column if there's no search query, but in case
  // we *want* to sort by a column even in case of searches, then we can simply
  // override the search definition as part of "extra".
  if (defs.sort.default === undefined) {
    defs.sort.default = (state) => {
      if (state.q) return undefined // if we have a search, we don't sort
      return sort // otherwise we sort by the default column
    }
  }

  // infer the default order when the sort column matches the one passed to
  // `createBoundTableState`... we can always override the behavior by
  // adding a "desc" entry as an extra definition in the options.
  if (defs.desc.default === undefined) {
    defs.desc.default = (state) => {
      if (state.sort === sort) return desc // if the column matches, we keep the order
      return false // by default we sort in ascending order
    }
  }

  // create the reactive object and bind it to the router query
  const state = createBoundObject(defs, useRoute)

  // when "q" changes, we reset the sort column and order to their defaults
  // and it'll be up to the default function to check q and decide what to do...
  // also this is a non-immediate watch, as upon creations defaults will be
  // looked
  watch(() => state.q, () => {
    state.sort = getDefaultValueFor(defs.sort, state) as string
    state.desc = getDefaultValueFor(defs.desc, state) as boolean
  }) // not immediate... defaults will processed by create and potentially
  // overridden by th, { immediate: true })

  // we need to track filters here, so that we can reset offset on changes
  for (const [ key, def ] of Object.entries(defs)) {
    if ('isFilter' in def && def.isFilter) {
      watch(() => (state as any)[key], () => state.offset = 0)
    }
  }

  // done!
  return state as any
}
