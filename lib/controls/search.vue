<template>
  <z-string
    ref="_zstring"
    v-model="value"
    :debounce="debounce"
    :clearable="clearable"
    :label="$t(translations.search)"
    :icon="icons.search"

    :readonly="readonly"
    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :lazy-rules="lazyRules"
    @click-icon="() => {}"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { icons } from '../assets/icons'
import { translations } from '../assets/translations'
import ZString from '../inputs/string.vue'
import { componentFormProps } from '../utils/form'

/** Ref to our `ZString` */
const _zstring = ref<InstanceType<typeof ZString>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZControlSearch' })

defineProps({
  /** The debounce time in milliseconds for the input field */
  debounce: {
    type: Number,
    required: false,
    default: 750,
  },
  /** Clearable, when clicked value will become the empty string */
  clearable: {
    type: Boolean,
    required: false,
    default: false,
  },
  ...componentFormProps,
})

const value = defineModel({
  type: String,
  required: true,
})

/* ===== SETUP ============================================================== */

/* Exposed stuff */
defineExpose({
  /** Focus on this control */
  focus: () => _zstring.value?.focus(),
})

/* On mounted, validate our main ref */
onMounted(() => {
  if (! _zstring.value) throw new Error('No QInput ref')
})

</script>
