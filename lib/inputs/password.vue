<template>
  <z-text
    ref="_ztext"
    v-bind="$attrs"
    v-model="_value"

    raw
    mode="text"
    :type="_visible ? 'text' : 'password'"

    :label="_label"
    :placeholder="placeholder"
    :hint="hint"
    :icon="undefined"

    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :readonly="readonly"

    :required="required"
    :rules="_rules"
    :lazy-rules="lazyRules"

    @clear="_value = ''"
  >
    <template #append>
      <q-icon
        :name="icons.visibility[_visible ? 'off' : 'on']"
        class="z-icon z-icon-clickable"
        @click="_visible = ! _visible"
      />
    </template>
  </z-text>
</template>

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { QIcon } from 'quasar'
import { computed, onMounted, ref } from 'vue'

import { icons } from '../assets/icons'
import { useValidators } from '../composition/validators'
import { componentFormProps } from '../utils/form'
import ZText from './text.vue'

import type { PropType } from 'vue'
import type { ZValidator } from '../composition/validators'

const validators = useValidators()
const { t } = useTranslator()

/** Ref to our `ZText` */
const _ztext = ref<InstanceType<typeof ZText>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZString', inheritAttrs: false })

const _props = defineProps({

  /* ===== FRILLS =========================================================== */

  /** The label for this input text */
  label: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
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

/** Validation rules */
const _rules = computed(() => {
  const rules: ZValidator<string>[] = []
  if (_props.minLength > 0) rules.push(validators.minLength(_props.minLength))
  rules.push(..._props.rules)
  return rules
})

/** Label */
const _label = computed(() => _props.label || t({ en: 'Password', de: 'Passwort' }))

/** Password visibility */
const _visible = ref(false)

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
