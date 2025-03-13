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
    :rules="_rules"
    :lazy-rules="lazyRules"
    :prefix="_flag"

    @beforeinput="_onBeforeinput"
    @clear="_setPrefix(), _setFlag()"
    @blur="_checkValue"
  />
</template>

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { computed, onMounted, ref, watch } from 'vue'

import { countries } from '../assets/countries'
import { componentFormProps } from '../utils/form'
import ZText from './text.vue'

import type { PropType } from 'vue'
import type { ZValidator } from '../composition/validators'

const translator = useTranslator()

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

/* ===== MODEL ======================================================= */

/** The value of the input */
const _value = defineModel({
  type: String,
  required: false,
  default: '',
})

/* ===== STATE ========================================================= */

/** The flag */
const _flag = ref()

/** The temporary value. We only update the model-value if it is longer than the prefix */
/** (to avoid saving the mere prefix as a phone number, when not required) */
const _tempValue = ref<string>('')

/** Ze prefix (only the numbers, no +) */
const _prefix = ref<string>()

/** We watch changes in the _tempValue and the prefix, and update the model value */
watch([ () => _tempValue.value, () => _prefix.value ], () => {
  if (_tempValue.value !== `+${_prefix.value}`) _value.value = _tempValue.value
  else _value.value = ''
})

/** If the country changes (and there is no phone number yet) > we change prefix + flag */
watch(() => _props.country, (newCountry) => {
  const newPrefix = countries.find((country) => country.code === newCountry)?.dial_code || ''
  // if there is no phone number yet > change prefix + flag
  if (_tempValue.value === `+${_prefix.value}`) {
    _tempValue.value = `+${newPrefix}`
    _prefix.value = newPrefix
    _flag.value = translator.utils.flag(_props.country as any)
  }
})

/* ===== VALIDATION ========================================================= */

/** Validation rules */
const _rules = computed<ZValidator<string>[]>(() => [
  (value: string) => {
    const number = value
        .replace(/[^\d\s]+/g, '') // wipe all non-space non-digit
        .replace(/^[\s0]+/, '') // wipe all leading spaces and zeros
        .replace(new RegExp(`^(${_prefix.value})`), `+${_prefix.value}`) // add a + if already starting with a prefix
        .replace(new RegExp(`^(?!\\+${_prefix.value})`), `+${_prefix.value}`) // otherwise, add the prefix
        .replace(new RegExp(`^\\+${_prefix.value}`), `+${_prefix.value} `) // and a space behind it
        .replace(/\s+/g, ' ') // normalize all spaces to ONE space

    _tempValue.value = number
        .replace(/[^\d]+/g, '') // strip all non-digit (including leading +)
        .replace(/^/, '+') // add a + to make it ITU format

    if (value.match(/\+[1-9][\d]{8,14}$/)) return true
    return 'The format is not correct'
  },
  // Rules from props
  ..._props.rules,
] satisfies ZValidator<string>[])

/* ===== AUTOFILL =========================================================== */

function _onBeforeinput(event: InputEvent): void {
  // paste, autofill, .... leave it up to the validation
  if (event.inputType !== 'insertText') return
  // the "insertText" event is when we _type_ something, only numbers and + for the prefix!
  if (event.data?.match(/^[0-9+]$/)) return
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
  /* Set prefix + flag from country */
  _setPrefix()
  _setFlag()
})

/* ===== ACTIONS ============================================================== */

/** Set the prefix */
function _setPrefix(): void {
  _prefix.value = countries.find((country) => country.code === _props.country)?.dial_code
  _tempValue.value = `+${_prefix.value}`
}
/** Set the flag */
function _setFlag(): void {
  _flag.value = translator.utils.flag(_props.country as any)
}

/** We check the value (when the input field loses focus) */
function _checkValue(): void {
  // if the value is empty (no prefix) > reset prefix
  if (! _tempValue.value) _setPrefix()
  // if the value starts with the prefix > all good
  else if (_tempValue.value.startsWith(`+${_prefix.value}`)) return
  // if the prefix was changed manually > update flag
  else _getFlagFromPrefix()
}

/** Update the flag */
function _getFlagFromPrefix(): void {
  // get the country code
  const country = countries.find((country) => _tempValue.value.startsWith(`+${country.dial_code}`))
  // save the new prefix
  _prefix.value = country?.dial_code
  // save the flag
  _flag.value = translator.utils.flag(country?.code as any)
}
</script>
