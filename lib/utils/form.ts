import { inject, onBeforeUnmount, provide, reactive, ref, shallowRef, triggerRef, watch } from 'vue'

import type { PropType, Ref, ShallowRef } from 'vue'

/* The props handled by the form and affecting its children behavior */
export type ZFormProps = {
  editable: boolean
  formEditable: boolean
  disabled: boolean
  lazyRules: boolean | 'ondemand'
  bottomSlots: boolean
}

/* Our defaults */
const defaults = {
  editable: true,
  formEditable: true,
  disabled: false,
  lazyRules: false,
  bottomSlots: false,
} as const satisfies ZFormProps

/* Symbols for injection */
const _editableSymbol = Symbol('ZForm:Editable')
const _disabledSymbol = Symbol('ZForm:Disabled')
const _lazyRulesSymbol = Symbol('ZForm:LazyRules')
const _bottomSlotsSymbol = Symbol('ZForm:BottomSlots')
const _readyStateSymbol = Symbol('ZForm:ReadyState')

/** The properties shared by all inputs that can be included in a `ZForm` */
export const formProps = {
  /** Whether to reserve space for the bottom slots or not */
  bottomSlots: {
    type: Boolean as PropType<boolean | undefined>,
    required: false,
    default: undefined,
  },
  /** Editable state, overriding the active state */
  editable: {
    type: Boolean as PropType<boolean | undefined>,
    required: false,
    default: undefined,
  },
  /** Disabled state, overriding the editable and active states */
  disabled: {
    type: Boolean as PropType<boolean | undefined>,
    required: false,
    default: undefined,
  },
  /**
   * When to apply validation rules.
   *
   * If set to boolean true then it checks validation status against the rules
   * only after field loses focus for first time; If set to "ondemand" then it
   * will trigger only when component's validate() method is manually called or
   * when the wrapper QForm submits itself
   */
  lazyRules: {
    type: [ Boolean, String ] as PropType<boolean | 'ondemand'>,
    required: false,
    default: undefined,
  },
} as const

/** The properties shared by all inputs that can be included in a `ZForm` */
export const componentFormProps = {
  ...formProps,
  /**
   * When "true" this overrides the "editable" property (whose default can
   * be inherited from the owning form) forcedly preventing editability */
  readonly: {
    type: Boolean as PropType<boolean | undefined>,
    required: false,
    default: undefined,
  },
} as const

/** For `ZForm`, provide the current form properties to children components */
export function provideFormProps(props: Partial<ZFormProps>): void {
  provide(_editableSymbol, () => props.editable != null ? props.editable : defaults.editable)
  provide(_disabledSymbol, () => props.disabled != null ? props.disabled : defaults.disabled)
  provide(_lazyRulesSymbol, () => props.lazyRules != null ? props.lazyRules : defaults.lazyRules)
  provide(_bottomSlotsSymbol, () => props.bottomSlots != null ? props.bottomSlots : defaults.bottomSlots)
}

/** Merge the specified props from a component with the ones from the owning `ZForm` */
export function mergeFormProps(props: Partial<ZFormProps & { readonly?: boolean | undefined }>): Readonly<ZFormProps> {
  const editable = inject<() => ZFormProps['editable']>(_editableSymbol, () => defaults.editable)
  const disabled = inject<() => ZFormProps['disabled']>(_disabledSymbol, () => defaults.disabled)
  const lazyRules = inject<() => ZFormProps['lazyRules']>(_lazyRulesSymbol, () => defaults.lazyRules)
  const bottomSlots = inject<() => ZFormProps['bottomSlots']>(_bottomSlotsSymbol, () => defaults.bottomSlots)

  const object = reactive<ZFormProps>({
    editable: false,
    formEditable: false,
    disabled: false,
    lazyRules: false,
    bottomSlots: false,
  })

  watch([ () => props.editable, () => props.readonly, editable ], ([ propValue, readonly, formValue ]) => {
    const formEditable = propValue == null ? (formValue || false) : propValue
    const editable = readonly === true ? false : formEditable
    if (formEditable != object.formEditable) object.formEditable = formEditable
    if (editable != object.editable) object.editable = editable
  }, { immediate: true })

  watch([ () => props.disabled, disabled ], ([ propValue, formValue ]) => {
    const value = propValue == null ? (formValue || false) : propValue
    if (value != object.disabled) object.disabled = value
  }, { immediate: true })

  watch([ () => props.lazyRules, lazyRules ], ([ propValue, formValue ]) => {
    const value = propValue == null ? (formValue || false) : propValue
    if (value != object.lazyRules) object.lazyRules = value
  }, { immediate: true })

  watch([ () => props.bottomSlots, bottomSlots ], ([ propValue, formValue ]) => {
    const value = propValue == null ? (formValue || false) : propValue
    if (value != object.bottomSlots) object.bottomSlots = value
  }, { immediate: true })

  return object
}

/** For `ZForm`, provide a `ShallowRef` to an object holding the ready state */
export function provideFormReadyState(): Ref<boolean> {
  const state = shallowRef<Record<string, boolean>>({})
  provide(_readyStateSymbol, state)

  const ready = ref(false)

  watch(state, (state) => {
    for (const value of Object.values(state)) {
      if (value) continue
      if (ready.value) ready.value = false
      return
    }

    if (! ready.value) ready.value = true
  })

  return ready
}

/** Provide a callback to `ZForm` to evaluate the component's ready state */
export function formReadyState(callback: () => boolean): void {
  const callbacks = inject<ShallowRef<Record<string, boolean>> | null>(_readyStateSymbol, null)
  if (! callbacks) return // not in a form

  // crypto.randomUUID() is not available on Safari in insecure contexts (e.g. app development)
  const key = btoa([ ...crypto.getRandomValues(new Uint8Array(15)) ].map((c) => String.fromCharCode(c)).join(''))
  const watcher = watch(callback, (ready) => {
    if (callbacks.value[key] === ready) return
    callbacks.value[key] = ready
    triggerRef(callbacks)
  }, { immediate: true })

  onBeforeUnmount(() => {
    delete callbacks.value[key]
    watcher()
  })
}
