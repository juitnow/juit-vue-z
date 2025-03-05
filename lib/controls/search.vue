<template>
  <z-string
    ref="_zstring"
    v-model="value"
    :debounce="750"
    :label="$t(translations.search)"
    :icon="icons.search"

    :readonly="readonly"
    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :lazy-rules="lazyRules"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { icons } from '../assets/icons'
import { translations } from '../assets/translations'
import ZString from '../inputs/string.vue'
import { componentFormProps } from '../utils/form'

const _zstring = ref<InstanceType<typeof ZString>>()

defineOptions({ name: 'ZControlSearch' })

defineProps(componentFormProps)

const value = defineModel({
  type: String,
  required: true,
})

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
