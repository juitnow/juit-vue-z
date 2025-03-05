<template>
  <z-btn-dropdown
    flat
    dense
    no-icon-animation
    :auto-close="true"
    :disable="disable"
    :size="dense ? 'sm' : 'md'"
    :dropdown-icon="icons.table.rows"
    :tooltip="$t({ en: 'Rows', de: 'Reihen' })"
  >
    <q-list dense bordered>
      <q-item
        v-for="(option, i) in options"
        :key="i"
        :class="{ 'bg-shade-primary text-primary': length === option.value }"
        clickable
        @click="length = option.value"
      >
        <q-item-section class="text-right">
          <q-item-label>{{ option.value }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            size="xs"
            class="q-ml-sm"
            :name="option.icon"
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
import type { ZTableRowsOptions } from '../../utils/tables'

defineOptions({ name: 'ZFooterRows' })

defineProps({
  /** Make this compact (or not!) */
  dense: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Definition of the various row options */
  options: {
    type: Array as PropType<ZTableRowsOptions>,
    required: true,
  },
  /** Disable the control (for example, when loading) */
  disable: {
    type: Boolean,
    required: false,
    default: false,
  },
})

/** The number of rows currently visible */
const length = defineModel({
  type: Number,
  required: true,
})
</script>
