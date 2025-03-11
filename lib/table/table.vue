<template>
  <!-- default slot (controls) goes *outside* when not secondary (full screen or enclosed) -->
  <div
    v-if="slots.default && (! secondary)"
    class="row justify-end q-gutter-sm q-mb-md z-table-controls"
  >
    <z-input-group :disabled="loading">
      <slot name="default" />
    </z-input-group>
  </div>

  <!-- the actual table -->
  <q-table
    v-model:fullscreen="full"
    v-model:selected="selected"
    v-bind="$attrs"
    :columns="tableColumns"
    :dense="dense"
    :loading="loading"
    :pagination="{ rowsPerPage: -1 }"
    :row-key="rowKey"
    :rows="tableRows"
    :visible-columns="visible"
    :selection="selection ? 'multiple' : 'none'"
    :hide-bottom="tableRows.length ? hideBottom : false"
    no-route-fullscreen-exit
    bordered
    flat
  >
    <!-- title when secondary (full screen or enclosed) -->
    <template v-if="title && secondary" #top-left>
      <div class="text-h6 text-uppercase text-bold">
        {{ title }}
      </div>
    </template>

    <!-- controls when secondary (full screen or enclosed) -->
    <template v-if="slots.default && secondary" #top-right>
      <div class="row justify-end q-gutter-sm z-table-controls">
        <z-input-group :disabled="loading">
          <slot name="default" />
        </z-input-group>
      </div>
    </template>

    <!-- table header -->
    <template #header="data">
      <table-header
        v-model="state"
        :selection="!! selection"
        :borders="slots.default && secondary"
        :loading="loading"
        :columns="columns"
        :slot-data="data"
        :dense="dense"
      />
    </template>

    <!-- table body -->
    <template #body="scope">
      <!-- table row: v-for loop is handled by qtable -->
      <q-tr
        :props="scope"
        :style="rowStyle?.(scope.row)"
        :class="`
          ${scope.__trClass}
          ${rowClass?.(scope.row) || ''}
          ${onRowClick ? 'cursor-pointer' : ''}
        `"
        @click="onRowClick?.($event, scope.row, scope.rowIndex)"
        @dblclick="onRowDblclick?.($event, scope.row, scope.rowIndex)"
        @contextmenu="onRowContextmenu?.($event, scope.row, scope.rowIndex)"
      >
        <!-- create link once per row, using v-for to contextualize variable -->
        <template v-for="link in [ rowLink?.(scope.row) ]" :key="link">
          <!-- selection checkbox, only if selecting -->
          <q-td v-if="scope.selected !== undefined" class="text-center shrink">
            <q-checkbox v-model="scope.selected" dense :size="dense ? 'xs' : undefined" />
          </q-td>

          <!-- table cell -->
          <q-td v-for="col in scope.cols" :key="col.name" :props="scope">
            <!-- optionally wrap the contents of the cell in a router link -->
            <table-link :to="link">
              <!-- if we have a *data* slot call it-->
              <div v-if="slots[`data-${col.name}`]">
                <slot
                  :name="`data-${col.name}`"
                  :index="scope.rowIndex"
                  :row="scope.row"
                  :value="col.value"
                />
              </div>
              <!-- otherwise, just display the value -->
              <div v-else>
                {{ col.value }}
              </div>
            </table-link>
          </q-td>
        </template>
      </q-tr>
    </template>

    <!-- bottom row -->
    <template v-if="slots['bottom-row']" #bottom-row>
      <slot name="bottom-row" />
    </template>

    <!-- no-data slot -->
    <template #no-data>
      <template v-if="loading">
        <q-spinner size="xs" class="q-mr-sm" color="grey" />
        <span>{{ $t({ en: 'Loading', de: 'Laden' }) }}</span>
      </template>
      <template v-else>
        <q-icon
          :name="icons.warning"
          class="fill-icon q-mr-sm"
          color="warning"
          size="xs"
        />
        <span>{{ $t({ en: 'No data available', de: 'Kein Daten vorhanden' }) }}</span>
      </template>
    </template>

    <!-- table bottom (pagination, controls, ...) -->
    <template #bottom>
      <div class="row col-12 items-center">
        <!-- record number (from, to, total number if known) -->
        <div :class="fixed ? 'col-6' : 'col-4'">
          <div class="row justify-start items-center">
            <div>
              {{ $n(state.offset + 1) }}
              &hellip;
              {{ $n(state.offset + Math.min(rows.length, length)) }}
              <span v-if="records && screen.gt.xs" aria-disabled>
                {{ $t({ en: 'of {n}', de: 'von {n}' }, { n: $n(records) }) }}
              </span>
            </div>
          </div>
        </div>

        <!-- pagination -->
        <div :class="fixed ? 'col-6' : 'col-4'">
          <div class="row items-center" :class="fixed ? 'justify-end' : 'justify-center'">
            <table-footer-pagination
              v-model="page"
              :dense="dense"
              :disable="loading"
              :next="rows.length > length"
              :last="last"
            />
          </div>
        </div>
        <div v-if="! fixed" class="col-4">
          <div class="row justify-end items-center">
            <table-footer-full-screen
              v-if="fullscreen"
              v-model="full"
              :dense="dense"
              :disable="loading"
            />
            <table-footer-columns
              v-if="optional"
              v-model="visible"
              :columns="optional"
              :dense="dense"
              :disable="loading"
            />
            <table-footer-rows
              v-model="length"
              :dense="dense"
              :disable="loading"
              :options="rowsOptions"
            />
          </div>
        </div>
      </div>
    </template>
  </q-table>
</template>

<!-- ===========================================================================
| SETUP                                                                        |
============================================================================ -->

<script setup lang="ts">
import { is, QCheckbox, QIcon, QSpinner, QTable, QTd, QTr, useQuasar } from 'quasar'
import { computed, defineComponent, h, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'


import { icons } from '../assets/icons'
import ZInputGroup from '../forms/input-group.vue'
import { tableEventProps } from '../utils/tables'
import TableFooterColumns from './layout/table-footer-columns.vue'
import TableFooterFullScreen from './layout/table-footer-fullscreen.vue'
import TableFooterPagination from './layout/table-footer-pagination.vue'
import TableFooterRows from './layout/table-footer-rows.vue'
import TableHeader from './layout/table-header.vue'

import type { QTableProps } from 'quasar'
import type { PropType, VNode } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { ZTableColumns, ZTableRowsOptions, ZTableState } from '../utils/tables'

const { screen } = useQuasar()

// ===== PROPS AND MODEL =======================================================

defineOptions({ name: 'ZTable' })

const props = defineProps({
  ...tableEventProps,
  /** Optional title for this table */
  title: {
    type: String,
    required: false,
    default: undefined,
  },
  /** Make this compact (or not!) */
  dense: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Enclosed table: renders controls within the table itself */
  enclosed: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Fixed table: do not allow selection of rows/column */
  fixed: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Can this table be expanded to full screen or not */
  fullscreen: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Hide the bottom pagination when not needed */
  hideBottom: {
    type: Boolean,
    required: false,
    default: false,
  },
  /**
   * Flag indicating the table is loading
   *
   * This can not be combined in the `state`, as any changes to the state
   * object trigger a reload of the data, and we end with an infinite loop.
   */
  loading: {
    type: Boolean,
    required: true,
  },
  /**
   * The rows to display (starting at `offset` with the given `limit`)
   *
   * This can not be combined in the `state`, as any changes to the state
   * object trigger a reload of the data, and we end with an infinite loop.
   */
  rows: {
    type: Array as PropType<any[]>,
    required: true,
  },
  /**
   * The total number of rows (if known)
   *
   * This can not be combined in the `state`, as any changes to the state
   * object trigger a reload of the data, and we end with an infinite loop.
   */
  total: {
    type: Number,
    required: false,
    default: 0,
  },
  /** Definition for the columns of this table */
  columns: {
    type: Object as PropType<ZTableColumns>,
    required: true,
  },
  /** Class(es) to apply to each row */
  rowClass: {
    type: Function as PropType<(row: any) => string | undefined>,
    required: false,
    default: undefined,
  },
  /** Style(s) to apply to each row */
  rowStyle: {
    type: Function as PropType<(row: any) => string | undefined>,
    required: false,
    default: undefined,
  },
  /** Style(s) to apply to each row */
  rowLink: {
    type: Function as PropType<(row: any) => RouteLocationRaw | string | undefined>,
    required: false,
    default: undefined,
  },
  /** The unique identifier of a row (must be supplied) */
  rowKey: {
    type: String,
    required: true,
  },
  /** Options specifying the row lengths to display fot this table */
  rowsOptions: {
    type: Array as PropType<ZTableRowsOptions>,
    required: false,
    default: ({ dense }: { dense?: boolean }) => {
      return dense ? [
        { value: 10, icon: icons.table.row.density[1] },
        { value: 25, icon: icons.table.row.density[2] },
        { value: 50, icon: icons.table.row.density[3] },
        { value: 100, icon: icons.table.row.density[4] },
      ] : [
        { value: 5, icon: icons.table.row.density[1] },
        { value: 15, icon: icons.table.row.density[2] },
        { value: 50, icon: icons.table.row.density[3] },
        { value: 100, icon: icons.table.row.density[4] },
      ]
    },
  },
})

/** Current state of the table */
const state = defineModel({
  type: Object as PropType<ZTableState>,
  required: true,
})

// ===== DATA SLOTS & EMITS ====================================================

const slots = defineSlots<{
  [ key: `data-${string}` ]: (props: { index: number, row: any, value: any }) => VNode[]
  'bottom-row'?: () => VNode[]
  'default'?: () => VNode[]
}>()

// ===== PAGINATION ============================================================

/** The current page number (zero-based) */
const page = ref<number>(0)
/** The last page number (if known, or zero) */
const last = computed<number>(() => Math.floor((props.total - 1) / length.value))
/** The number of rows to display (basically `limit - 1`) */
const length = ref<number>(0)
/** The total number of records (either from our prop or computed) */
const records = computed(() => {
  if (props.total) return props.total
  if (props.rows.length <= length.value) return state.value.offset + props.rows.length
  return 0
})
/** Secondary: if enclosed or in full screen renders control within the table */
const secondary = computed(() => props.enclosed || full.value)

// The order of these watchers is important, as `limit`, `length`, `offset`
// and `page` are all interdependent on each other.

watch([ () => state.value.offset, () => state.value.limit ], ([ offset, limit ]) => {
  if (limit <= 0) length.value = props.dense ? 10 : 15
  else length.value = limit - 1
  // must be calculated after the length above...
  page.value = Math.floor(offset / length.value)
}, { immediate: true })

watch(length, (length) => {
  state.value.limit = length + 1
}, { immediate: true })

watch(page, (page) => {
  state.value.offset = page * length.value
}, { immediate: true })

// ===== SELECTION =============================================================

/**
 * If this property is specified *and* is an array, this table will be
 * selectable, and the selection will include (in order) all selected rows
 */
const selection = defineModel('selection', {
  type: Array as PropType<any[] | undefined>,
  required: false,
  default: undefined,
})

/** The selection for q-table (unordered) */
const selected = ref<any[]>([])

watch(() => props.rows, () => selected.value = [])

/* Watch "selected" (from q-table) and emit the selection in order */
watch(selected, (selected) => {
  if (! selection.value) return // no "selection" model

  // quick check on empty selection
  if (selected.length === 0) {
    if (selection.value.length === 0) return
    selection.value = []
    return
  }

  // get the keys selected in q-table
  const selectedKeys = selected
      .map((row) => row[props.rowKey])
      .filter((key) => !! key)

  // get the keys selected by the parent
  const selectionKeys = selection.value
      .map((row) => row[props.rowKey])
      .filter((key) => !! key)

  // prepare a new selection (keys and rows)
  const newSelection: any[] = []
  const newSelectionKeys: any[] = []
  for (const row of props.rows) {
    const key = row[props.rowKey]
    if (selectedKeys.includes(key)) {
      newSelectionKeys.push(key)
      newSelection.push(row)
    }
  }

  // if the selection has changed, emit it it
  if (is.deepEqual(selectionKeys, newSelectionKeys)) return
  selection.value = newSelection
})

/* Watch "selection" (from parent) and update "selected" (for q-table) */
watch(selection, (selection) => selected.value = selection || [], { immediate: true })

// ===== COLUMNS VISIBILITY ====================================================

/** All _optional_ columns (as, _they can be hidden_) */
const optional = computed<ZTableColumns | undefined>(() => {
  const entries = Object.entries(props.columns)
      .filter(([ _, { hidden } ]) => hidden !== 'never')

  if (! entries.length) return undefined

  return entries.reduce((optional, [ name, column ]) => {
    optional[name] = column
    return optional
  }, {} as ZTableColumns)
})

/** Current list of _visible_ columns */
const visible = ref<string[]>([])

// Compute visible columns, adding and removing as necessary
watch(() => props.columns, (newColumns, oldColumns = {}) => {
  // Compute the list of _new_ visible column names
  const newVisible = Object.entries(newColumns)
      .filter(([ _, { hidden } ]) => hidden === 'never' || (! hidden))
      .map(([ name ]) => name)

  // Compute the list of _old_ visible column names
  const oldVisible = Object.entries(oldColumns)
      .filter(([ _, { hidden } ]) => hidden === 'never' || (! hidden))
      .map(([ name ]) => name)

  // Compute the columns to add and remove from our current list
  const add = newVisible.filter((name) => ! oldVisible.includes(name))
  const del = oldVisible.filter((name) => ! newVisible.includes(name))

  // Update the list of visible columns
  visible.value = [ ...visible.value, ...add ].filter((name) => ! del.includes(name))
}, { immediate: true })

// ===== LOCAL STATE ===========================================================

/** Flag indicating we're in full-screen */
const full = ref(false)

// ===== QUASAR TABLE PROPERTIES ===============================================

/** The rows to display in the Quasar table */
const tableRows = computed(() => props.rows.slice(0, length.value))

/** The column definitions for the Quasar table */
const tableColumns = computed<Exclude<QTableProps['columns'], undefined>>(() => {
  return Object.entries(props.columns).map(([ name, col ]) => ({
    name,
    label: name, // we override in our header/column picker
    field: col.value || name,
    align: col.align || 'left',
    sortable: false, // do not let Quasar sort the columns
    style: col.style,
    classes: col.class,
  } satisfies Exclude<QTableProps['columns'], undefined>[0]))
})

// ===== OPTIONAL LINK FOR TABLE ROW ===========================================

const TableLink = defineComponent({
  name: 'TableLink',
  props: {
    to: {
      type: [ String, Object ] as PropType<RouteLocationRaw>,
      required: false,
      default: undefined,
    },
  },

  setup: (props, ctx) => () => {
    if (! ctx.slots.default) return []
    if (! props.to) return ctx.slots.default()
    return h(RouterLink, { to: props.to, class: 'table-link' }, ctx.slots.default)
  },
})
</script>

<style scoped lang="pcss">
/* Let padding be done by a.table-link */
td.q-td:has(a.table-link) {
  padding: 0;
  vertical-align: top;
}

td.q-td.shrink {
  width: 1px;
}

/* Turn an "<a href=...>" into a glorified div */
a.table-link {
  display: block;
  color: inherit;
  text-decoration: none;
  /* fill the cell */
  width: 100%;
  height: 100%;

  /* center the content vertically */
  > div {
    position: relative;
    transform: translateY(-50%);
    top: 50%;
    /* overflow and text trimming of nested DIV */
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Remove the top border from the "no-data" bottom slot */
:deep(.q-table__bottom--nodata) {
  border-top: none;
}

/* Colorize loading in the primary color */
:deep(.q-linear-progress) {
  color: var(--q-primary) !important;
}

/* Add padding for each cell (basically, cloned the quasar defaults) */
td.q-td a.table-link {
  padding: 7px 16px;
}

.q-table--dense td.q-td a.table-link {
  padding: 4px 8px;
}

.q-table--dense td.q-td:first-child a.table-link {
  padding-left: 16px;
}

.q-table--dense td.q-td:last-child a.table-link {
  padding-right: 16px;
}

/* Constrain padding for the table top */
:deep(.q-table__top) {
  padding: 12px 16px;
}

.q-table--dense :deep(.q-table__top) {
  padding: 12px 16px;
}

/* Default width for search and other inputs */
.z-table-controls :deep(.q-input) {
  width: 200px;
}

</style>
