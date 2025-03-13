<template>
  <z-select
    v-model="_value"

    :readonly="readonly"
    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :lazy-rules="lazyRules"

    :required="required"
    :clearable="clearable"
    :suffix="suffix"
    :options="_countries"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :prefix="_flag"
    :icon="icon"
  >
    <template #option="scope">
      <q-item v-bind="scope.itemProps" dense>
        <q-item-section>
          <q-item-label>
            {{ scope.label }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-item-label>
            {{ scope.opt.flag }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </z-select>
</template>

<script setup lang="ts">
import { ISO_COUNTRIES, useTranslator } from '@juit/vue-i18n'
import { QItem, QItemLabel, QItemSection } from 'quasar'
import { computed } from 'vue'

import { componentFormProps } from '../utils/form'
import ZSelect from './select.vue'

import type { PropType } from 'vue'

const translator = useTranslator()

/* ===== NAME, PROPS, MODEL, ... ============================================ */

defineOptions({ name: 'ZSelect' })

defineProps({

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
  /** The suffix to display after the input value */
  suffix: {
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

const _value = defineModel({
  type: String as PropType<string>,
  required: false,
})


const _flag = computed(() => {
  return _value.value ? translator.utils.flag(_value.value as any) : ''
})

const _countries = computed(() => {
  // Prepare the countries
  const countries: { value: string, label: string, flag: string }[] = []

  // Add all countries, with nice flags in the labels
  for (const code of ISO_COUNTRIES) {
    const label = translator.utils.country(code)
    const flag = translator.utils.flag(code)
    countries.push({ value: code, label: label, flag })
  }

  // Always sort by translated country NAME ("Vereinigte Staaten" is not "U")
  countries.sort((a, b) => a.label.localeCompare(b.label))

  // Done
  return countries
})
</script>
