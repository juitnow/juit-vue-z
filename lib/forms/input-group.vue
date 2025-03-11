<template>
  <slot name="default" v-bind="$attrs" />
</template>

<script lang="ts" setup>
import { nextTick, watch } from 'vue'

import { formProps, provideFormProps, provideFormReadyState } from '../utils/form'

import type { VNode } from 'vue'

/* ===== NAME, PROPS, SLOTS, ... ============================================ */

defineOptions({ name: 'ZInputGroup' })

const _props = defineProps(formProps)

defineSlots<{
  default: () => VNode[],
}>()

/* ===== LOCAL STUFF ======================================================== */

provideFormProps(_props)

/** The focused element, saved before disabling, and restored after */
let _focused: Element | null = null

/* Watch the `disabled` prop and save the focused element, when this is
 * changed to _true_, and restore the old focused element on _false */
watch(() => _props.disabled, (disabled) => {
  if (disabled) return _focused = document.activeElement
  nextTick(() => { // wait for reactivity to update the DOM
    if (_focused instanceof HTMLElement) {
      _focused.focus()
      _focused = null
    }
  })
})

defineExpose({
  /** A flag indicating that the "required" constraint (if any) was fulfilled */
  isReady: provideFormReadyState(),
})
</script>
