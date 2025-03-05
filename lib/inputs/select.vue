<template>
  <div class="z-input">
    <z-form-helper
      ref="_helper"
      v-slot="formProps"
      :bottom-slots="bottomSlots"
      :disabled="disabled"
      :editable="editable"
      :lazy-rules="lazyRules"
      :readonly="readonly"
    >
      <q-select
        ref="_qselect"
        v-model="_value"

        dense
        outlined
        stack-label
        map-options
        emit-value
        hide-dropdown-icon
        no-error-icon

        :class="
          formProps.disabled ? 'z-state-disabled' :
          formProps.editable ? 'z-state-editable' :
          'z-state-inactive'"

        :label="label"
        :prefix="prefix"
        :hint="hint"
        :bottom-slots="formProps.bottomSlots"
        :hide-bottom-space="! formProps.bottomSlots"
        :icon

        :disable="formProps.disabled"
        :readonly="! formProps.editable"
        :rules="_rules"

        :options="_options"
        :behavior="'menu'"
      >
        <template #append>
          <!-- More stuff from the parent -->
          <slot v-if="_slots.prepend" name="prepend" v-bind="formProps" />
          <!-- First icon, dropdown (only visible when editable) -->
          <q-icon
            v-if="formProps.editable"
            :name="icons.select"
            class="z-icon"
          />
          <!-- Second icon, error -->
          <q-icon
            v-if="_qselect?.hasError"
            :name="icons.error"
            class="z-icon z-icon-error"
          />
          <!-- Third icon, clearable/required -->
          <q-icon
            v-if="formProps.editable && _value && clearable"
            :name="icons.cancel"
            class="z-icon z-icon-clickable"
            @click.stop.prevent="_value = ''"
          />
          <q-icon
            v-else-if="(! _value) && required"
            :name="icons.required"
            class="z-icon"
          />
          <!-- Fourth icon, parent icon -->
          <q-icon
            v-if="icon"
            :name="icon"
            class="z-icon"
          />
          <!-- More stuff from the parent -->
          <slot v-if="_slots.append" name="append" v-bind="formProps" />
        </template>

        <!-- When specified, use the "option" slot from the caller -->
        <template v-if="_slots.option" #option="scope">
          <slot name="option" v-bind="scope" />
        </template>

        <!-- The default option template, dense -->
        <template v-else #option="scope">
          <q-item v-bind="scope.itemProps" dense>
            <q-item-section>
              <q-item-label>
                {{ scope.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </z-form-helper>
  </div>
</template>

<script setup lang="ts">
import { QIcon, QItem, QItemSection, QSelect } from 'quasar'
import { computed, onMounted, ref, watch } from 'vue'

import { icons } from '../assets/icons'
import { useValidators } from '../composition/validators'
import ZFormHelper from '../forms/form-helper.vue'
import { componentFormProps, formReadyState } from '../utils/form'

import type { QSelectSlots } from 'quasar'
import type { PropType, VNode } from 'vue'
import type { ZFormProps } from '../utils/form'

const validators = useValidators()

/** Ref to our `QSelect` */
const _qselect = ref<QSelect>()

/** Ref to our `ZFormHelper` */
const _helper = ref<InstanceType<typeof ZFormHelper>>()

/* ===== NAME, PROPS, MODEL, ... ============================================ */

defineOptions({ name: 'ZSelect' })

const _props = defineProps({

  /* ===== OPTIONS ========================================================== */

  /** All our options, keyed by the option, with values being the labels */
  options: {
    type: Object as PropType<Record<string, string> | { value: string, label: string }[]>,
    required: true,
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
  /** The prefix to display before the input value */
  prefix: {
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

  /* ===== OTHER OPTIONS ==================================================== */

  /** Clearable, when clicked value will become the empty string */
  clearable: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Required */
  required: {
    type: Boolean,
    required: false,
    default: false,
  },

  ...componentFormProps,
})

/** The currently selected option */
const _value = defineModel({
  type: String,
  required: false,
  default: undefined,
})

/* Slots */
const _slots = defineSlots<{
  prepend?: (formProps: Readonly<ZFormProps>) => VNode[]
  append?: (formProps: Readonly<ZFormProps>) => VNode[]
  option?: QSelectSlots['option']
}>()

/* Exposed stuff */
defineExpose({
  /** Focus on this control */
  focus: () => _qselect.value?.focus(),
  /** Reset validation for this field */
  resetValidation: () => _qselect.value?.resetValidation(),
  /** Force validation of this field */
  validate: () => _qselect.value?.validate() || false,
  /** If the field has validation errors or not */
  hasError: computed(() => _qselect.value?.hasError || false),
})

/* ===== STATE ============================================================== */

/** Convert options from a record to an array and sort */
const _options = computed(() => {
  if (Array.isArray(_props.options)) return _props.options

  return Object.entries(_props.options)
      .map(([ value, label ]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
})

/* ===== VALIDATION ========================================================= */

/** The validation rules to apply to this field */
const _rules = computed(() => {
  // Remember, Quasar won't clear the error if there are no rules!!!
  return _props.required ? [ validators.required() ] : [ () => true ]
})

/* When editable or validation rules change, reset validation */
watch([ () => _helper.value?.isEditable, _rules ], () => _qselect.value?.resetValidation())

/* Ready state for parent ZForm */
formReadyState(() => {
  if (_qselect.value?.hasError) return false
  if (_props.required) return !! _value.value
  return true
})

/* ===== SETUP ============================================================== */

/* Ensure the ZText ref is set */
onMounted(() => {
  if (! _qselect.value) throw new Error('No QSelect ref')
  if (! _helper.value) throw new Error('No ZFormHelper ref')
})
</script>
