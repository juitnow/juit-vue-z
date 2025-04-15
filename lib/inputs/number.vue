<template>
  <z-nullable-number
    ref="_znumber"
    v-bind="{ ...$attrs, required: false, validateNull: true }"

    :model-value="_znumber?.isEditable ? (_number || null) : _number"
    :mode="mode"

    :label="label"
    :placeholder="`0${suffix}`"
    :hint="hint"
    :icon="icon"

    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :readonly="readonly"

    :suffix="suffix"

    :rules="rules"
    :lazy-rules="lazyRules"
    :minimum="minimum"
    :maximum="maximum"

    @update:model-value="_number = $event || 0"
  >
    <template v-if="_slots.append" #append="formProps">
      <slot name="append" v-bind="formProps" />
    </template>
  </z-nullable-number>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'

import { componentFormProps } from '../utils/form'
import ZNullableNumber from './nullable-number.vue'

import type { PropType, VNode } from 'vue'
import type { ZValidator } from '../composition/validators'
import type { ZFormProps } from '../utils/form'

/** Ref to our `ZNullableNumber` */
const _znumber = ref<InstanceType<typeof ZNullableNumber>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZNumber', inheritAttrs: false })

defineProps({

  /* ===== INPUT TYPE ======================================================= */

  /** The virtual keyboard to use on mobile devices*/
  mode: {
    type: String as PropType<'decimal' | 'numeric'>,
    required: false,
    default: 'decimal',
  },

  /* ===== FRILLS =========================================================== */

  /** The label for this input text */
  label: {
    type: String,
    required: true,
  },
  /** The hint to display below the input field */
  hint: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
  },
  /** The icon to display within the control */
  icon: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
  },

  /* ===== UTILITY PROPS ==================================================== */

  /** The suffix to add to the input */
  suffix: {
    type: String as PropType<string>,
    required: false,
    default: '',
  },

  /* ===== VALIDATION ======================================================= */

  /** Minimum value (inclusive) */
  minimum: {
    type: Number as PropType<number | undefined>,
    required: false,
    default: undefined,
  },
  /** Maximum value (inclusive) */
  maximum: {
    type: Number as PropType<number | undefined>,
    required: false,
    default: undefined,
  },
  /** The validation rules to apply to this field */
  rules: {
    type: Array as PropType<ZValidator<number>[]>,
    required: false,
    default: () => [],
  },

  ...componentFormProps,
})

/** The value of the input */
const _number = defineModel({
  type: Number as PropType<number>,
  required: false,
  default: 0,
})

/* Slots */
const _slots = defineSlots<{
  append?: (formProps: Readonly<ZFormProps>) => VNode[]
}>()

/* Exposed stuff */
defineExpose({
  /** Focus on this control */
  focus: () => _znumber.value?.focus(),
  /** Reset validation for this field */
  resetValidation: () => _znumber.value?.resetValidation(),
  /** Force validation of this field */
  validate: () => _znumber.value?.validate() || false,
  /** If the field has validation errors or not */
  hasError: computed(() => _znumber.value?.hasError || false),
})

/* ===== SETUJP ============================================================= */

/* Ensure the ZNullableNumber ref is set */
onMounted(() => {
  if (! _znumber.value) throw new Error('No ZNullableNumber ref')
  /* As we use a placehoder with NULL for zero, once mounted and reactivity
   * settles down, we want to reset our validation */
  nextTick(() => _znumber.value?.resetValidation())
})
</script>
