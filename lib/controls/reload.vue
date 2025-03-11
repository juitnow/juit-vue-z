<template>
  <z-form-helper
    v-slot="scope"
    :readonly="readonly"
    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :lazy-rules="lazyRules"
  >
    <z-btn
      dense
      class="z-control"
      :disable="scope.disabled"
      :icon="icons.reload"
      :tooltip="$t({ en: 'Reload', de: 'Neu laden'})"
      @click="_reload = _reload + 1"
    />
  </z-form-helper>
</template>

<script setup lang="ts">
import { icons } from '../assets/icons'
import ZBtn from '../buttons/btn.vue'
import ZFormHelper from '../forms/form-helper.vue'
import { componentFormProps } from '../utils/form'

defineOptions({ name: 'ZControlReload' })

defineProps(componentFormProps)

const _reload = defineModel({
  type: Number,
  required: true,
})
</script>
