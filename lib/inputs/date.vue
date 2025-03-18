<template>
  <z-text
    ref="_ztext"
    v-bind="$attrs"
    non-interactive
    :model-value="_localized"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"

    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :readonly="readonly"

    :required="required"
    :on-clear="_onClear"
    @click="_onClick"
  >
    <template #append>
      <!-- Popup proxy for date picking -->
      <q-popup-proxy
        ref="_qpopup"
        no-parent-event
        :target="_target"
        @before-hide="_hiding = true"
        @hide="_hiding = false"
      >
        <q-date
          minimal
          mask="YYYY-MM-DD"
          :model-value="_value"
          :first-day-of-week="1"
          @update:model-value="_onUpdate"
        />
      </q-popup-proxy>

      <!-- Icon for the picker -->
      <q-icon
        v-if="_ztext?.isEditable"
        class="z-icon z-icon-clickable"
        :name="icon"
        @click="_onClick"
      />
      <q-icon v-else class="z-icon" :name="icon" />
    </template>
  </z-text>
</template>

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { QDate, QIcon, QPopupProxy } from 'quasar'
import { computed, onMounted, ref } from 'vue'

import { icons } from '../assets/icons'
import { componentFormProps } from '../utils/form'
import ZText from './text.vue'

import type { DateTimeFormatAlias } from '@juit/vue-i18n'
import type { PropType } from 'vue'

const { d } = useTranslator()

/** Ref to our `ZText` */
const _ztext = ref<InstanceType<typeof ZText>>()
/** Ref to our `QPopupProxy` */
const _qpopup = ref<QPopupProxy>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZDate', inheritAttrs: false })

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
    type: String as PropType<string>,
    required: false,
    default: icons.date,
  },
  format: {
    type: [ String, Object ] as PropType<DateTimeFormatAlias | Intl.DateTimeFormatOptions>,
    required: false,
    default: 'date',
  },

  /* ===== UTILITY PROPS ==================================================== */

  /** Indicates that the field is required (and errors when empty). */
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Indicates that the field can be cleared (sets the date to ''). */
  clearable: {
    type: [ Boolean, String ] as PropType<boolean | 'today'>,
    required: false,
    default: false,
  },

  ...componentFormProps,
})

/** The value of the input */
const _value = defineModel({
  type: String,
  required: false,
  default: '',
})

/** The localized value to display */
const _localized = computed(() => d(_value.value, _props.format, 'UTC'))

/* ===== POPUP MANAGEMENT =================================================== */

const _target = computed(() => _ztext.value?.$el.querySelector('.q-field__inner') || undefined)
const _hiding = ref(false)

function _today(): string {
  const today = new Date()
  const year = String(today.getFullYear()).padStart(4, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function _onClick(event: MouseEvent): void {
  if (! _hiding.value) _qpopup.value?.toggle()
  event.stopPropagation()
  event.preventDefault()
}

function _onUpdate(value: string): void {
  if (! value) return // ignore when QDate clears the value
  if (value !== _value.value) _value.value = value
  _qpopup.value?.hide()
}

const _onClear = computed((): (() => void) | undefined => {
  // Easy cases...
  if (_props.clearable === false) return undefined
  if (_props.clearable === true) return () => _value.value = ''
  // When clearable is set to "today", we clear only if value is _not_ today
  if (_props.clearable === 'today') {
    if (_value.value === _today()) return undefined
    return () => _value.value = _today()
  } else return undefined
})

/* ===== SETUP ============================================================== */

/* Ensure the ZText ref is set */
onMounted(() => {
  /* Set value if none was specified and clearable is set to "today" */
  if ((! _value.value) && (_props.clearable === 'today')) _value.value = _today()

  if (! _ztext.value) throw new Error('No ZText ref')
  if (! _qpopup.value) throw new Error('No QPopupProxy ref')
})

/* ===== EXPOSE ============================================================= */

/* Exposed stuff */
defineExpose({
  /** Reset validation for this field */
  resetValidation: () => _ztext.value?.resetValidation(),
  /** Force validation of this field */
  validate: () => _ztext.value?.validate() || false,
  /** If the field has validation errors or not */
  hasError: computed(() => _ztext.value?.hasError || false),
  /** Return _today_ in date format (`yyyy-mm-dd`) in the current timezone */
  today: () => _today(),
})
</script>
