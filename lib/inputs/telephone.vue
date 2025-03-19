<template>
  <z-text
    ref="_ztext"
    v-bind="$attrs"
    v-model="_input"
    type="text"
    mode="tel"

    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :icon="icon"

    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :readonly="readonly"

    :rules="_rules"
    :lazy-rules="lazyRules"
    :prefix="_flag"

    @beforeinput="_onBeforeinput"
    @clear="() => _value = ''"
  />
</template>

<script setup lang="ts">
import { ISO_COUNTRIES, useTranslator } from '@juit/vue-i18n'
import { computed, nextTick, onMounted, ref, shallowRef, triggerRef, watch } from 'vue'

import { countriesByITUPrefix, ituPrefixesByCountry } from '../assets/prefixes'
import { componentFormProps } from '../utils/form'
import ZText from './text.vue'

import type { ISOCountry } from '@juit/vue-i18n'
import type { PropType } from 'vue'
import type { ITUPrefix } from '../assets/prefixes'
import type { ZValidator } from '../composition/validators'

/** Describes a vaild, checked ITU phone prefix */
interface PhonePrefix {
  /** The current country (if properly validated) as an ISO code */
  country: ISOCountry
  /** The countries associated with the current prefix */
  countries: [ ISOCountry, ...ISOCountry[]]
  /** The current country prefix (if properly validated) as an ITU code */
  prefix: ITUPrefix
}

/** Describe a phone number, parsed in parts */
interface PhoneParts {
  /** The current country (if properly validated) as an ISO code */
  country: ISOCountry | ''
  /** The countries associated with the current prefix */
  countries: ISOCountry[]
  /** The current country prefix (if properly validated) as an ITU code */
  prefix: ITUPrefix | ''
  /** The regional number (that is digits without the country prefix) */
  number: string
  /** The normalized number as `+{prefix}{number}` even if invalud */
  normalized: string
  /** A flag indicating if this is a valid number */
  valid: boolean,
}

const { t, utils } = useTranslator()

/** Ref to our `ZText` */
const _ztext = ref<InstanceType<typeof ZText>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZTelephone', inheritAttrs: false })

const _props = defineProps({
  /** The country the telephone number belongs to */
  country: {
    type: String as PropType<string>,
    required: false,
    default: 'DE',
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

/* ===== MODEL ============================================================== */

/** The value of the input, the full number *with* the prefix */
const _value = defineModel({
  type: String,
  required: false,
  default: '',
})

/* ===== UTILITIES ========================================================== */

/* Check that the prefix is valid, returning the country and the prefix */
function _checkPrefix(string: string): PhonePrefix | undefined {
  if (! string) return undefined // no match...

  // Maximum length of an ITU prefix is 4 digits
  if (string.length > 4) string = string.slice(0, 4)

  // Check if the prefix is in our list of prefixes
  if (string in countriesByITUPrefix) {
    const prefix = string as ITUPrefix
    const countries = countriesByITUPrefix[prefix]
    // if the prefix has our default "prop" country, we return that, otherwise the first
    const country = countries.find((country) => country === _isoCountry.value)
    return { country: country || countries[0], countries, prefix }
  }

  // Recursively proceed with a shorter prefix
  return _checkPrefix(string.slice(0, -1))
}

/* Check that the number is valid, returning country, prefix and normalized number */
function _checkNumber(value: string = ''): PhoneParts {
  // Normalize the number, keeping only digits
  value = value.replace(/[^\d]/g, '')

  // Check if we have a valid prefix
  const phonePrefix = _checkPrefix(value)

  // Return the parts: a "valid" number has a regional part of at least
  // six digits (this is an arbirary value, but works for most countries)
  return phonePrefix ? {
    countries: phonePrefix.countries,
    country: phonePrefix.country,
    prefix: phonePrefix.prefix,
    number: value.slice(phonePrefix.prefix.length),
    normalized: `+${value}`,
    valid: value.length >= phonePrefix.prefix.length + 6,
  } : {
    countries: [],
    country: '',
    prefix: '',
    number: value,
    normalized: value ? `+${value}` : '',
    valid: false,
  }
}

/** Format the "parts" separating any valid prefix from the number */
function _formatParts(parts: PhoneParts): string {
  return (parts.prefix && parts.number) ? `+${parts.prefix} ${parts.number}` :
         parts.prefix ? `+${parts.prefix}` :
         parts.number ? `+${parts.number}` :
        ''
}

/* ===== STATE ============================================================== */

/** Computed property ensuring that the country is a valid ISO country */
const _isoCountry = computed<ISOCountry>(() => {
  const country = ISO_COUNTRIES.find((country) => country === _props.country)
  return country || 'DE' // our default country is Germany
})

/** The flag, computed by the current country (validated) */
const _flag = computed(() => {
  if (_parts.value.country) return utils.flag(_parts.value.country)
  return '\u{1F3F4}\u200D\u2620\uFE0F' // Arrr! That be a bust!
})

/** The parsed phone number parts, initially from the input value */
const _parts = shallowRef<PhoneParts>(_checkNumber(_value.value))
/** The input value, as displayed in our text box */
const _input = ref<string>(_formatParts(_parts.value))

/* ===== WATCHERS =========================================================== */

/* When the country prop changes, we update the number if empty */
watch(_isoCountry, (country) => {
  // If this is a simple change of country on the same prefix, update the
  // country in-place and manually trigger the ref to update the flag
  if (_parts.value.countries.includes(country)) {
    _parts.value.country = country
    triggerRef(_parts)
    return
  }

  // If we already have a number, then we don't change the country
  if (_parts.value.number) return

  // Get the prefix, and update the parts
  const prefix = ituPrefixesByCountry[_isoCountry.value][0]
  _parts.value = _checkNumber(prefix)
  _input.value = _formatParts(_parts.value)
}, { immediate: true })

/* Watch when the model value changes */
watch(_value, (value) => {
  const parts = _checkNumber(value)
  if (parts.normalized === _parts.value.normalized) return // no changes
  _input.value = _formatParts(parts)
  _parts.value = parts
})

/* Watch when the input value changes */
watch(_input, (input) => {
  // If the input was fully cleared, we reset to the default country
  if (input.trim() === '') {
    return nextTick(() => {
      const prefix = ituPrefixesByCountry[_isoCountry.value][0]
      _parts.value = _checkNumber(prefix)
      _input.value = _formatParts(_parts.value)
    })
  }

  // If we have _some_ input, and that's is not a valid phone number "+digits"
  // we re-format it in the next tick (so that quasar has time to update the
  // input). We'll get called back again with the new "clean" value...
  if (input) {
    const clean = '+' + input
        .replace(/[^\d\s]/g, ' ') // wipe all non-space non-digit
        .replace(/\s+/g, ' ') // normalize all spaces to ONE space
        .trim() // remove leading and trailing spaces

    // Call us back again with the cleaned input in the next tick...
    if (input !== clean) return nextTick(() => _input.value = clean)
  }

  const parts = _checkNumber(input)
  if (parts.normalized === _parts.value.normalized) return // no changes
  _value.value = parts.normalized
  _parts.value = parts
})

/* ===== VALIDATION ========================================================= */

/** Validation rules */
const _rules: ZValidator<string>[] = [ () => {
  // As we're mangling the text, we need to validate against the current
  // state (henceforth, the current "value", not the input)
  const value = _value.value

  // Check if required....
  if (_props.required && (!value)) {
    return t({
      en: 'This field is required',
      de: 'Dieses Feld ist erforderlich',
    })

  // When not required, the empty value is a good value
  } else if (! value) {
    return true
  }

  // Check the parts and the validity of our number
  if (! _checkNumber(value).valid) {
    return t({
      en: 'Invalid phone number',
      de: 'Ungültige Telefonnummer',
    })
  }

  // Run all other configured validators
  for (const validator of (_props.rules || [])) {
    const result = validator(value)
    if (result !== true) return result
  }

  // All is good
  return true
} ]

/* ===== AUTOFILL =========================================================== */

function _onBeforeinput(event: InputEvent): void {
  // paste, autofill, .... leave it up to the validation
  if (event.inputType !== 'insertText') return
  // the "insertText" event is when we _type_ something, only numbers plus and space
  if (event.data?.match(/^[0-9+ ]$/)) return
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

onMounted(() => {
  /* Ensure the ZText ref is set */
  if (! _ztext.value) throw new Error('No ZText ref')
})
</script>
