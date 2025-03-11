<template>
  <z-form-helper
    v-slot="scope"
    :readonly="readonly"
    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :lazy-rules="lazyRules"
  >
    <z-btn-group class="rounded-borders">
      <z-btn
        v-for="option in options"
        :key="option.value"
        dense
        class="z-control"
        style="margin-right: -1px;"
        :class="{ 'z-control-active': value === option.value }"
        :icon="option.icon"
        :disable="scope.disabled"
        :tooltip="option.tooltip"

        @click="value = (value === option.value) ? undefined : option.value"
      />
    </z-btn-group>
  </z-form-helper>
</template>

<script setup lang="ts">
import ZBtnGroup from '../buttons/btn-group.vue'
import ZBtn from '../buttons/btn.vue'
import ZFormHelper from '../forms/form-helper.vue'
import { componentFormProps } from '../utils/form'

import type { PropType } from 'vue'

defineOptions({ name: 'ZControlSwitch' })

defineProps({
  /** The options for this selection */
  options: {
    type: Array as PropType<{ icon: string, value: string, tooltip?: string }[]>,
    required: true,
  },
  ...componentFormProps,
})

const value = defineModel({
  type: String as PropType<string | undefined>,
  required: false,
  default: undefined,
})
</script>

<style lang="postcss" scoped>
.q-btn-group {
  .z-control:not(:first-child) {
    border-left: none;
  }
}

</style>
