<template>
  <z-text
    ref="_ztext"
    v-bind="$attrs"
    v-model="_value"

    type="text"
    :mode="mode"

    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :icon="icon"
    :link="link"

    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :readonly="readonly"

    :debounce="debounce"
    :suffix="suffix"

    :required="required"
    :max-length="maxLength"
    :rules="_rules"
    :lazy-rules="lazyRules"

    @clear="_value = ''"
  >
    <template v-if="_slots.append" #append="formProps">
      <slot name="append" v-bind="formProps" />
    </template>
  </z-text>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useValidators } from '../composition/validators'
import { componentFormProps } from '../utils/form'
import ZText from './text.vue'

import type { PropType, VNode } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { ZValidator } from '../composition/validators'
import type { ZFormProps } from '../utils/form'

const validators = useValidators()

/** Ref to our `ZText` */
const _ztext = ref<InstanceType<typeof ZText>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZString', inheritAttrs: false })

const _props = defineProps({

  /* ===== INPUT TYPE ======================================================= */

  /** The virtual keyboard to use on mobile devices*/
  mode: {
    type: String as PropType<'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'>,
    required: false,
    default: 'text',
  },

  /* ===== FRILLS =========================================================== */

  /** The label for this input text */
  label: {
    type: String,
    required: true,
  },
  /** The placeholder text when no input was entered */
  placeholder: {
    type: String,
    required: false,
    default: '',
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
  /** An optional link that will make the icon navigable */
  link: {
    type: [ Object, String ] as PropType<RouteLocationRaw | undefined>,
    required: false,
    default: undefined,
  },

  /* ===== UTILITY PROPS ==================================================== */

  /** The debounce time in milliseconds for the input field */
  debounce: {
    type: Number as PropType<number | undefined>,
    required: false,
    default: undefined,
  },
  /** The suffix to add to the input */
  suffix: {
    type: String as PropType<string>,
    required: false,
    default: '',
  },

  /* ===== VALIDATION ======================================================= */

  /** Indicates that the field is required (and errors when empty). */
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** The minimum length of this field (starting at 1, for 0 use "required") */
  minLength: {
    type: Number,
    required: false,
    default: 0,
  },
  /**  The maximum length, displayed with a counter (and error when too long). */
  maxLength: {
    type: Number,
    required: false,
    default: 0,
  },
  /** The validation rules to apply to this field */
  rules: {
    type: Array as PropType<ZValidator<string>[]>,
    required: false,
    default: () => [],
  },

  ...componentFormProps,
})

/** The value of the input */
const _value = defineModel({
  type: String,
  required: false,
  default: '',
})

/* Slots */
const _slots = defineSlots<{
  append?: (formProps: Readonly<ZFormProps>) => VNode[]
}>()

/** Validation rules */
const _rules = computed(() => {
  const rules: ZValidator<string>[] = []
  if (_props.minLength > 0) rules.push(validators.minLength(_props.minLength))
  rules.push(..._props.rules)
  return rules
})

/* ===== SETUP ============================================================== */

/* Exposed stuff */
defineExpose({
  /** Focus on this control */
  focus: () => _ztext.value?.focus(),
  /** Reset validation for this field */
  resetValidation: () => _ztext.value?.resetValidation(),
  /** Force validation of this field */
  validate: () => _ztext.value?.validate() || false,
  /** If the field has validation errors or not */
  hasError: computed(() => _ztext.value?.hasError || false),
})

/* Ensure the ZText ref is set */
onMounted(() => {
  if (! _ztext.value) throw new Error('No ZText ref')
})
</script>
