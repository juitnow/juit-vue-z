<template>
  <z-control-toggle
    v-model="deleted"
    :icon="icons.visibility.deleted"
    :tooltip="deleted ?
      $t({ en: 'Hide deleted', de: 'Gelöscht ausblenden'}) :
      $t({ en: 'Show deleted', de: 'Gelöscht anzeigen'})"
    :readonly="readonly"
    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :lazy-rules="lazyRules"
  />
</template>

<script setup lang="ts">
import { icons } from '../assets/icons'
import { componentFormProps } from '../utils/form'
import ZControlToggle from './toggle.vue'

defineOptions({ name: 'ZControlDeleted' })

defineProps(componentFormProps)

const deleted = defineModel({
  type: Boolean,
  required: true,
})
</script>
