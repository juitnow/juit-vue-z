<template>
  <q-tr :props="slotData" :class="slotData.__trClass">
    <!-- present only when in selection mode, checkbox to select all -->
    <q-th
      v-if="selection"
      class="shrink"
      :class="{
        'bg-shade-primary text-primary': ! loading,
        'bg-shade disabled': loading,
      }"
    >
      <q-checkbox
        v-model="slotData.selected"
        :size="slotData.dense ? 'xs' : undefined"
        toggle-order="tf"
        dense
      />
    </q-th>

    <!-- table headers -->
    <q-th
      v-for="(column, name) in columns"
      :key="name"
      :props="slotData"
      class="relative-position"
      :style="borders && 'border-top-width: 1px'"
      :class="{
        'q-focusable q-hoverable': !! sortable[name],
        'cursor-pointer': (!! sortable[name]) && (! loading),
        'bg-shade-primary text-primary': ! loading,
        'bg-shade disabled': loading,
      }"
      @click="loading || toggleSort(name)"
    >
      <div v-if="!! sortable[name]" class="q-focus-helper" tabindex="-1" />

      <!-- ensure we're properly centered on the column -->
      <q-icon v-if="column.align === 'center'" class="q-mr-sm" />

      <!-- label for left/center-aligned content -->
      <span v-if="column.align !== 'right'" class="text-uppercase text-weight-bold q-mr-sm">
        {{ typeof column.label === 'function' ? column.label() : column.label }}
      </span>

      <!-- arrows to be shown when this column is being sorted -->
      <q-icon
        v-if="(column.sort || name) === state.sort"
        :name="state.desc ? icons.sorting.descending : icons.sorting.ascending"
      />

      <!-- icon to be shown for all non-sorting, but sortable columns -->
      <q-icon v-else-if="!! sortable[name]" :name="icons.sorting.unsorted" />

      <!-- label for right-aligned content -->
      <span v-if="column.align === 'right'" class="text-uppercase text-weight-bold q-ml-sm">
        {{ typeof column.label === 'function' ? column.label() : column.label }}
      </span>
    </q-th>
  </q-tr>
</template>

<!-- ===========================================================================
| SETUP                                                                        |
============================================================================ -->

<script setup lang="ts">
import { computed } from 'vue'

import { icons } from '../../assets/icons'

import type { QTableSlots } from 'quasar'
import type { PropType } from 'vue'
import type { ZTableColumns, ZTableState } from '../../utils/tables'

// ===== PROPS AND MODEL =======================================================

defineOptions({ name: 'ZTableHeader' })

const props = defineProps({
  /** Thin border at the top of the heade */
  borders: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Our columns definitions */
  columns: {
    type: Object as PropType<ZTableColumns>,
    required: true,
  },
  /** Whether the table rows are currently loading */
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Whether to add the selection checkbox header or not */
  selection: {
    type: Boolean,
    required: false,
    default: false,
  },
})

/** Current state of the table */
const state = defineModel({
  type: Object as PropType<ZTableState>,
  required: true,
})

/** The semi-opaque slot data for this header */
const slotData = defineModel('slotData', {
  type: Object as PropType<Parameters<QTableSlots['header']>[0]>,
  required: true,
})


// ===== LOCALS ================================================================

/** All sortable columns, associated with their default order */
const sortable = computed<Record<string, { sort: string, order: 'asc' | 'desc' }>>(() => {
  return Object.entries(props.columns).reduce((columns, [ name, column ]) => {
    const sort = column.sort || name
    if (column.sortable === true) columns[name] = { sort, order: 'asc' }
    else if (column.sortable === 'asc') columns[name] = { sort, order: 'asc' }
    else if (column.sortable === 'desc') columns[name] = { sort, order: 'desc' }
    return columns
  }, {} as Record<string, { sort: string, order: 'asc' | 'desc' }>)
})

/** Toggle sort when clicking on a header */
function toggleSort(name: string): void {
  const column = sortable.value[name]
  if (! column) return

  // what's the default (first) order for the column? default is ascending!
  // const defaultOrder = column.order // === 'desc' ? 'desc' : 'asc'

  // toggle and update the sort model back to the parent
  if (state.value.sort === column.sort) {
    if (column.order === 'desc') {
      if (state.value.desc) state.value.desc = false
      else { // reset
        state.value.sort = undefined
        state.value.desc = false
      }
    } else {
      if (! state.value.desc) state.value.desc = true
      else { // reset
        state.value.sort = undefined
        state.value.desc = false
      }
    }
  } else {
    state.value.desc = column.order === 'desc'
    state.value.sort = column.sort
  }
}
</script>
