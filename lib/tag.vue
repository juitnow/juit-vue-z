<template>
  <q-chip
    dense
    class="q-mx-none q-px-sm text-weight-medium text-uppercase"
    :style="removable ? 'padding-right: 5px;' : undefined"
    :color="color"
    :text-color="textColor"
    :size="size"
    :removable="removable"
    @remove="removable && onRemove()"
  >
    {{ tag }}
  </q-chip>
</template>

<script setup lang="ts">
import { QChip } from 'quasar'

import type { PropType } from 'vue'

defineOptions({ name: 'ZTag' })

defineProps({
  tag: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: false,
    default: 'sm',
  },
  color: {
    type: String,
    required: false,
    default: 'primary',
  },
  textColor: {
    type: String,
    required: false,
    default: 'white',
  },
  removable: {
    type: Boolean,
    required: false,
    default: false,
  },
  onRemove: {
    type: Function as PropType<() => void>,
    required: false,
    default: () => {},
  },
})
</script>

<style lang="postcss" scoped>
.q-chip {
  cursor: default;
  user-select: none;
}

:deep(.q-chip__icon--remove) {
  margin-left: 4px;
}
</style>
