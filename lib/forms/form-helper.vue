<template>
  <slot name="default" v-bind="_formProps" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { componentFormProps, mergeFormProps } from '../utils/form'

import type { VNode } from 'vue'
import type { ZFormProps } from '../utils/form'

defineOptions({ name: 'ZFormHelper' })

const _props = defineProps(componentFormProps)
const _formProps = mergeFormProps(_props)
defineSlots<{
  default: (formProps: Readonly<ZFormProps>) => VNode[]
}>()

defineExpose({
  isEditable: computed(() => _formProps.editable),
  isFormEditable: computed(() => _formProps.formEditable),
  isLazyRules: computed(() => _formProps.lazyRules),
  isBottomSlots: computed(() => _formProps.bottomSlots),
  isDisabled: computed(() => _formProps.disabled),
})
</script>
