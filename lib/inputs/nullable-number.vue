<template>
  <z-text
    ref="_ztext"
    v-bind="{ ..._attrs, validateNull: undefined }"
    v-model="_string"
    type="text"
    :mode="mode"

    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :icon="icon"

    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :readonly="readonly"

    :suffix="suffix"

    :required="required"
    :rules="_rules"
    :lazy-rules="lazyRules"

    :on-clear="() => _number = null"

    @beforeinput="_onBeforeinput($event)"
  />
</template>

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { computed, onMounted, ref, useAttrs, watch } from 'vue'

import { useValidators } from '../composition/validators'
import { componentFormProps } from '../utils/form'
import ZText from './text.vue'

import type { PropType } from 'vue'
import type { ZValidator } from '../composition/validators'

const validators = useValidators()
const translator = useTranslator()

/** Ref to our `ZText` */
const _ztext = ref<InstanceType<typeof ZText>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZNullableNumber', inheritAttrs: false })

const _attrs = useAttrs()

const _props = defineProps({

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

  /* ===== UTILITY PROPS ==================================================== */

  /** The suffix to add to the input */
  suffix: {
    type: String as PropType<string>,
    required: false,
    default: '',
  },

  /* ===== VALIDATION ======================================================= */

  /** Required (that is, we need a non-null number, non-empty string) */
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
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
  type: [ Number, null ] as PropType<number | null>,
  required: false,
  default: null,
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
  /** If the field has validation errors or not */
  isEditable: computed(() => _ztext.value?.isEditable || false),
})

/* ===== VALIDATION ========================================================= */

/** Shallow ref to be replaced when the numeric rules change */
const _rules = computed<ZValidator<string>[]>(() => {
  const rules: ZValidator<number>[] = [
    // "isNaN" or "Infinity" are not valid numbers
    (value: number) => ! isNaN(value),
    (value: number) => Number.isFinite(value),
  ]

  // Minimum and maximum values
  if (_props.minimum !== undefined) rules.push(validators.minimum(_props.minimum))
  if (_props.maximum !== undefined) rules.push(validators.maximum(_props.maximum))

  // All other rules
  rules.push(..._props.rules)

  // A single text validation rule, ignoring its input and validating the number
  // value; since "_rules" is a shallow ref, this will trigger `ztext`, too!
  return [ (string: string) => {
    const number = _parseNumber(string)

    // We use the _attr_ "validateNull" set to "true" to force validation
    // of nulls as zero from "j-number" here! Not a prop, as we don't want
    // to expose externally, though!
    if (number === null && (! _attrs.validateNull)) return true

    for (const rule of rules) {
      const result = rule(number || 0)
      if (typeof result === 'string') return result
      if (result === false) return false
    }
    return true
  } ]
})

/* ===== NUMBER HANDLING ==================================================== */

/** Thousands separator (`,` comma in english, `.` dot in german) */
const tsep = computed(() => (1234).toLocaleString(translator.locale)[1]!)
/** Decimals separator (`.` dot in english, `,` comma in german) */
const dsep = computed(() => (1.23).toLocaleString(translator.locale)[1]!)
/** The updated model value, as a string, from the parent component */
const _string = ref<string>(_formatNumber(_number.value))

/** "onBeforeInput" prevents anything but numbers to be typed in our field */
function _onBeforeinput(event: InputEvent): void {
  const element = event.target as HTMLInputElement

  // paste, autofill, .... leave it up to the validation
  if (event.inputType !== 'insertText') return

  // the "insertText" event is when we _type_ something
  if (
    // have we typed only digits???
    (event.data?.match(/^\d+$/)) ||
    // have we typed the only decimal separator???
    ((event.data === dsep.value) && (element.value.indexOf(dsep.value) < 0)) ||
    // have we typed a negation sign (at the beginning of the input)???
    ((event.data === '-') && (element.value[0] !== '-') && (element.selectionStart === 0))
  ) return // then let this event through!

  // if this event is a simple "." we consider it to be a decimal separator
  // as on iOS the default "decimal" keboard uses it as a delimiter
  if ((event.data === '.' ) && (element.value.indexOf(dsep.value) < 0)) {
    const string = element.value
    const pos = element.selectionStart == null ? string.length : element.selectionStart
    const end = element.selectionEnd == null ? pos : element.selectionEnd
    element.value = string.slice(0, pos) + dsep.value + string.slice(end)
    element.selectionStart = element.selectionEnd = pos + 1
    _string.value = element.value
  }

  // if we typed anything else, then prevent...
  return event.preventDefault()
}

/** Format a number, either for editing or viewing */
function _formatNumber(number: number | null): string {
  // Nulls result in an empty string
  if (number === null) return ''

  // Use thousans separators when only when *NOT* editing
  return number.toLocaleString(translator.locale, {
    maximumFractionDigits: 20,
    useGrouping: ! _ztext.value?.hasFocus,
  })
}

/* Parse a number from an internationalized string */
function _parseNumber(string: string): number | null {
  // Normalize our input into a JavaScript value (de: 1.234,5 becomes 1234.5)
  string = string
      .replaceAll(tsep.value, '')
      .replaceAll(dsep.value, '.')
      .replaceAll(/[^-.\d]/g, '')

  // Parse the string as a float number (a single '-' is considered null) and
  // '-0' drops its sign and is considered a zero (IEE-754 has negative zero)
  return string === '' ? null : string === '-' ? null : (parseFloat(string) || 0)
}

/* When focus or language change, reformat the number */
watch([ () => _ztext.value?.hasFocus, () => translator.locale ], () => {
  _string.value = _formatNumber(_number.value)
})

/* Update the `modelValue` in the child text component */
watch(_number, (number) => {
  // When the number change, reformat *if* the numeric value changes
  if (number === _parseNumber(_string.value)) return
  _string.value = _formatNumber(number)
})


/* Update the `modelValue` in the parent component */
watch(_string, (string): void => {
  // Update our parent with the new number if we have to
  const number = _parseNumber(string)
  if (_number.value !== number) _number.value = number
})

/* Ensure the ZText ref is set */
onMounted(() => {
  if (! _ztext.value) throw new Error('No ZText ref')
})
</script>
