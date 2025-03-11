<template>
  <z-text
    ref="_ztext"
    v-bind="$attrs"
    v-model="_value"
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
    :rules="_rules"
    :lazy-rules="lazyRules"

    :max-length="13"
    :suffix="_ztext?.isEditable ? _suffix : undefined"

    @clear="_value = ''"
    @beforeinput="_onBeforeinput"
    @keydown="_onKeydown"
  />
</template>

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { computed, onMounted, ref } from 'vue'

import { icons } from '../assets/icons'
import { useValidators } from '../composition/validators'
import { componentFormProps } from '../utils/form'
import ZText from './text.vue'

import type { PropType } from 'vue'
import type { ZValidator } from '../composition/validators'

const { minLength } = useValidators()
const { t } = useTranslator()

/** Ref to our `ZText` */
const _ztext = ref<InstanceType<typeof ZText>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZEan13', inheritAttrs: false })

const _props = defineProps({

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
    default: icons.barcode,
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

/** The value of the input */
const _value = defineModel({
  type: String,
  required: false,
  default: '',
})

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

/* ===== VALIDATION ========================================================= */

/** The suffix, padding the EAN13 to 13 characters */
const _suffix = computed(() => {
  if (! _value.value) return ''
  if (_value.value.length > 12) return ''
  if (_value.value.match(/[^0-9]/)) return ''

  // extend to 12 characters with zeroes, then add our checksum
  const suffix = '0'.repeat(12 - _value.value.length)
  return suffix + ean13Checksum(_value.value + suffix)
})

/** Validate as an EAN13 */
const _rules = computed<ZValidator<string>[]>(() => [
  // Minimum length
  minLength(13),
  // Only digits
  (value: string) => {
    if (value.match(/^[0-9]*$/)) return true
    return t({ en: 'Only numbers allowed', de: 'Nur Zahlen erlaubt' })
  },
  // EAN13 checksum validation
  (value: string) => { // checksum validation
    const slice = value.slice(0, 12)
    const checksum = ean13Checksum(slice)
    if (value === (slice + checksum)) return true
    return t({
      en: 'Last digit should be {checksum}',
      de: 'Letzte Ziffer sollte {checksum} sein',
    }, { checksum })
  },
  // Rules from props
  ..._props.rules,
] satisfies ZValidator<string>[])

function ean13Checksum(barcode: string): string {
  if (barcode.length < 12) return ''

  /* Calculate the weighted sum for the first 12 digits */
  let sum = 0
  for (let i = 0, w = 1; i < 12; i ++, w = i % 2 ? 3 : 1) {
    sum += (barcode.charCodeAt(i) - 0x30) * w
  }

  /* The checksum number is 10 - sum, we calculate it and convert it into a character */
  return String.fromCharCode(((10 - (sum % 10)) % 10) + 0x30)
}

/* ===== AUTOFILL =========================================================== */

function _onBeforeinput(event: InputEvent): void {
  // paste, autofill, .... leave it up to the validation
  if (event.inputType !== 'insertText') return
  // the "insertText" event is when we _type_ something, only numbers!
  if (event.data?.match(/^\d+$/)) return
  // something else but text
  event.preventDefault()
}

/** Track "Tab" and autocomplete if we have a suffix */
function _onKeydown(event: KeyboardEvent): void {
  if (! _suffix.value) return // no suffix? no autocomplete!
  const { key, altKey, ctrlKey, metaKey, shiftKey } = event
  if (altKey || ctrlKey || metaKey || shiftKey) return
  if (key !== 'Tab') return
  // Autocomplete to our suffix
  _value.value = _value.value + _suffix.value
  event.preventDefault()
}

/* ===== SETUP ============================================================== */

/* Ensure the ZText ref is set */
onMounted(() => {
  if (! _ztext.value) throw new Error('No ZText ref')
})
</script>
