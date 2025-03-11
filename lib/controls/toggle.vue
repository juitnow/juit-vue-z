<template>
  <z-form-helper
    v-slot="scope"
    :readonly="readonly"
    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :lazy-rules="lazyRules"
  >
    <z-btn
      dense
      class="z-control"
      :class="{ 'z-control-active': _value }"
      :disable="scope.disabled"
      :icon="_model ? icon : _iconOff"
      :tooltip="tooltip"
      @click="_model = ! _model"
    />
  </z-form-helper>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import ZBtn from '../buttons/btn.vue'
import ZFormHelper from '../forms/form-helper.vue'
import { componentFormProps } from '../utils/form'

defineOptions({ name: 'ZControlToggle' })

const _props = defineProps({
  /** The icon for this toggle */
  icon: {
    type: String,
    required: true,
  },
  iconOff: {
    type: String,
    required: false,
    default: undefined,
  },
  /** The tooltip, if any, for this toggle */
  tooltip: {
    type: String,
    required: false,
    default: '',
  },
  /** True is false, and false is true */
  negate: {
    type: Boolean,
    required: false,
    default: false,
  },
  ...componentFormProps,
})

const _model = defineModel({
  type: Boolean,
  required: true,
})

const _value = computed(() => _props.negate ? (! _model.value) : _model.value)
const _iconOff = computed(() => _props.iconOff || _props.icon)
</script>
