<template>
  <div class="row reverse q-col-gutter-sm justify-between q-py-lg">
    <!-- ===== MAIN CONTENT COLUMN ========================================= -->

    <div v-if="slots['default']" class="col-grow text-right self-center">
      <slot name="default" />
    </div>

    <!-- ===== TITLE (label) and SUBTITLE (caption) ======================== -->

    <div class="col-grow self-center text-left">
      <div class="text-h4 heading">
        <span v-if="label">{{ label }}</span>
        <slot v-else-if="slots.label" name="label" />
        <span v-else>{{ '\u2026' }}</span>
      </div>
      <div v-if="caption || slots.caption" class="heading">
        <span v-if="caption">{{ caption }}</span>
        <slot v-else-if="slots.caption" name="caption" />
      </div>
      <div v-if="slots.info" class="q-mt-md">
        <slot name="info" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, warn } from 'vue'

import type { VNode } from 'vue'

defineOptions({ name: 'ZObjectHeader' })

const props = defineProps({
  label: {
    type: String,
    required: false,
    default: '',
  },
  caption: {
    type: String,
    required: false,
    default: '',
  },
})

const slots = defineSlots<{
  default(): VNode[],
  caption?: () => VNode[],
  label?: () => VNode[],
  info?: () => VNode[],
}>()

onMounted(() => {
  if (props.label || slots.label) return
  warn('The "label" prop or slot must be specified')
})
</script>

<style scoped lang="postcss">
.heading {
  text-transform: uppercase;
  font-weight: 600;
}
</style>
