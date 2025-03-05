<template>
  <z-form-helper
    v-slot="scope"
    :readonly="readonly"
    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :lazy-rules="lazyRules"
  >
    <z-btn-dropdown
      dense
      class="z-control"
      :icon="icon"
      :disable="scope.disabled"
      :class="{ 'z-control-active': active }"
      :tooltip="tooltip"
    >
      <q-list dense bordered>
        <slot name="default" />
      </q-list>
    </z-btn-dropdown>
  </z-form-helper>
</template>

<script setup lang="ts">
import ZBtnDropdown from '../buttons/btn-dropdown.vue'
import ZFormHelper from '../forms/form-helper.vue'
import { componentFormProps } from '../utils/form'

defineOptions({ name: 'ZControlDropdown' })

defineProps({
  /** The icon for this toggle */
  icon: {
    type: String,
    required: true,
  },
  /** Whether this control should look "active" or not */
  active: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** The tooltip, if any, for this toggle */
  tooltip: {
    type: String,
    required: false,
    default: '',
  },
  ...componentFormProps,
})
</script>
