<template>
  <z-text
    ref="_ztext"
    v-bind="$attrs"
    v-model="_tempValue"
    type="text"
    mode="numeric"

    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :icon="icon"

    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :readonly="readonly"

    :required="required"
    :rules="country ? _rules : undefined"
    :lazy-rules="lazyRules"
    :prefix="`+${_prefix}`"

    @clear="_value = _tempValue = ''"
    @beforeinput="_onBeforeinput"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { countries } from '../assets/countries'
import { useValidators } from '../composition/validators'
import { componentFormProps } from '../utils/form'
import ZText from './text.vue'

import type { PropType } from 'vue'
import type { ZValidator } from '../composition/validators'

const { minLength, maxLength } = useValidators()

/** Ref to our `ZText` */
const _ztext = ref<InstanceType<typeof ZText>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZTelephone', inheritAttrs: false })

const _props = defineProps({

  /* ===== COUNTRY ============================================================= */

  /** The country the telephone number belongs to */
  country: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
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

  /* ===== VALIDATION ======================================================= */

  /** Indicates that the field is required (and errors when empty). */
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** The validation rules to apply to this field */
  rules: {
    type: Array as PropType<ZValidator<string>[]>,
    required: false,
    default: () => [],
  },

  ...componentFormProps,
})

/* ===== MODEL ======================================================= */

/** The value of the input (formatted) */
const _value = defineModel({
  type: String,
  required: false,
  default: '',
})

/** The temporary value, before the formatting (without the prefix, and with possible leading zeros) */
const _tempValue = ref<string>()

/** When the input changes, we format it and save it */
watch(() => _tempValue.value, (telephone) => {
  if (! telephone) return
  _value.value = telephone
      .replace(/^[\s0]+/, '') // wipe all leading spaces and zeros
      .replace(/^/, `+${_prefix.value}`) // add the prefix to the beginning of the string
})

/* ===== VALIDATION ========================================================= */

/** The preffix, depending on the country */
const _prefix = computed(() => {
  const country = countries.find((country) => country.code === _props.country)
  return country?.dial_code
})

/** If the country changes > we reset the phone number, since it will have the old prefix */
watch(() => _props.country, () => _value.value = _tempValue.value = '')

/** Validation rules */
const _rules = computed<ZValidator<string>[]>(() => [
  // min / max length
  minLength(7),
  maxLength(13),
  // rules from props
  ..._props.rules,
] satisfies ZValidator<string>[])

/* ===== AUTOFILL =========================================================== */

function _onBeforeinput(event: InputEvent): void {
  // paste, autofill, .... leave it up to the validation
  if (event.inputType !== 'insertText') return
  // the "insertText" event is when we _type_ something, only numbers!
  if (event.data?.match(/^\d+$/)) return
  // something else but text
  event.preventDefault()
}

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
