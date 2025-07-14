<template>
  <z-text
    ref="_ztext"
    v-bind="{ ..._attrs, validateNull: true }"
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

    :on-clear="() => _number = 0"

    @beforeinput="_onBeforeinput($event)"
  >
    <template v-if="_slots.append" #append="formProps">
      <slot name="append" v-bind="formProps" />
    </template>
  </z-text>
</template>

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { computed, onMounted, ref, useAttrs, watch } from 'vue'

import { componentFormProps } from '../utils/form'
import ZText from './text.vue'

import type { PropType, VNode } from 'vue'
import type { ZValidator } from '../composition/validators'
import type { ZFormProps } from '../utils/form'
const translator = useTranslator()

const { t } = useTranslator()

/** Ref to our `ZText` */
const _ztext = ref<InstanceType<typeof ZText>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZEuro', inheritAttrs: false })

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
  /** Minimum value (inclusive) > IN CENTS!!! */
  minimum: {
    type: Number as PropType<number | undefined>,
    required: false,
    default: undefined,
  },
  /** Maximum value (inclusive) > IN CENTS!!! */
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
  // We use our own rules, since the min/max value is in cents, but we want the error message in €
  if (_props.minimum !== undefined) {
    rules.push(
        (value: number) => {
          if (value >= _props.minimum!) return true
          return t({
            en: `Minimum ${_props.minimum! / 100} €`,
            de: `Mindestens ${_props.minimum! / 100} €`,
          })
        })
  }
  if (_props.maximum !== undefined) {
    rules.push(
        (value: number) => {
          if (value <= _props.maximum!) return true
          return t({
            en: `Maximum ${_props.maximum! / 100} €`,
            de: `Höchstens ${_props.maximum! / 100} €`,
          })
        })
  }

  // All other rules
  rules.push(..._props.rules)

  // A single text validation rule, ignoring its input and validating the number
  // value; since "_rules" is a shallow ref, this will trigger `ztext`, too!
  return [ (string: string) => {
    const number = _parseNumber(string)

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
function _formatNumber(number: number): string {
  // 0 returns just '0' (we don't want to add decimals)
  if (number === 0) return '0'

  // Transform cents in euro (/100)
  number/=100

  // Round to 2 decimal points
  // Use thousands separators only when *NOT* editing
  return number.toLocaleString(translator.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: ! _ztext.value?.hasFocus,
  })
}

/* Parse a number from an internationalized string */
function _parseNumber(string: string): number {
  // Normalize our input into a JavaScript value (de: 1.234,5 becomes 1234.5)
  string = string
  // remove thousands separator
      .replaceAll(tsep.value, '')
  // use dot as decimal separator
      .replaceAll(dsep.value, '.')
  // remove everything that is not a digit or a dot
      .replaceAll(/[^-.\d]/g, '')

  // Parse the string as a float number:
  // an empty string or a single '-' is considered 0
  // '-0' drops its sign and is considered a zero (IEE-754 has negative zero)
  // transform euro in cents (*100)
  return string === '' ? 0 : string === '-' ? 0 : (Math.round(parseFloat(string)*100))
}

/* When focus or language change, reformat the number */
watch([ () => _ztext.value?.hasFocus, () => translator.locale ], () => {
  _string.value = _formatNumber(_number.value)
})

/* Update the `modelValue` in the child text component (if the numeric value changes) */
watch(_number, (number) => {
  if (number !== _parseNumber(_string.value)) {
    _string.value = _formatNumber(number)
  }
})

/* Update the `modelValue` in the parent component (if the numeric value changes) */
watch(_string, (string): void => {
  if (_number.value !== _parseNumber(string)) {
    _number.value = _parseNumber(string)
  }
})

/* Ensure the ZText ref is set */
onMounted(() => {
  if (! _ztext.value) throw new Error('No ZText ref')
})
</script>
