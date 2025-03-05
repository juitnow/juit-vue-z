<template>
  <z-btn-dropdown
    flat
    dense
    no-icon-animation
    :disable="disable"
    :size="dense ? 'sm' : 'md'"
    :dropdown-icon="icons.table.columns"
    :tooltip="$t({ en: 'Columns', de: 'Spalten' })"
  >
    <q-list dense bordered>
      <q-item
        v-for="(column, name) in columns"
        :key="name"
        :class="{ 'bg-shade-primary text-primary': visible.includes(name) }"
        clickable
        @click="toggleVisible(name)"
      >
        <q-item-section>
          <q-item-label>
            {{ typeof column.label === 'function' ? column.label() : column.label }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            size="xs"
            :name="visible.includes(name) ? icons.visibility.on : icons.visibility.off"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </z-btn-dropdown>
</template>

<!-- ===========================================================================
| SETUP                                                                        |
============================================================================ -->

<script setup lang="ts">
import { icons } from '../../assets/icons'
import ZBtnDropdown from '../../buttons/btn-dropdown.vue'

import type { PropType } from 'vue'
import type { ZTableColumns } from '../../utils/tables'

// ===== PROPS AND MODEL =======================================================

defineOptions({ name: 'ZTableFooterColumns' })

defineProps({
  /** Make this compact (or not!) */
  dense: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** The columns to display in our control */
  columns: {
    type: Object as PropType<ZTableColumns>,
    required: true,
  },
  /** Disable the control (for example, when loading) */
  disable: {
    type: Boolean,
    required: false,
    default: false,
  },
})

/** Array of column **keys** that are currently visible */
const visible = defineModel({
  type: Array as PropType<string[]>,
  required: true,
})

// ===== LOCALS ================================================================

/** Toggle visibility on the specified column */
function toggleVisible(_name: string): void {
  if (visible.value.includes(_name)) {
    visible.value = visible.value.filter((c) => c !== _name)
  } else {
    visible.value = [ ...visible.value, _name ]
  }
}
</script>
