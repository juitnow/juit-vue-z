<!--+ This is *exactly* the same as the standard Quasar QBtnGroup, but we apply
    | our default "unelevated" design (rather than constantly repeating...)
    +-->
<template>
  <q-btn-dropdown
    ref="_ref"
    v-bind="{
      ...$attrs,
      ..._props,
      label: undefined,
      unelevated: true,
      tooltip: undefined,
    }"
    no-icon-animation
    :color="disable ? undefined : color"
    :text-color="disable ? undefined : textColor"
    :class="{ 'z-btn-disabled': disable, 'z-btn-flat': flat }"
  >
    <template #label>
      <slot v-if="_slots.label" name="label" />
      <template v-else-if="label">
        {{ label }}
      </template>
      <q-tooltip v-if="tooltip" :delay="500">
        {{ tooltip }}
      </q-tooltip>
    </template>

    <template v-if="_slots.loading">
      <slot name="loading" />
    </template>

    <slot v-if="_slots.default" name="default" />
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { QBtnDropdown, QTooltip } from 'quasar'
import { ref } from 'vue'

import type { QBtnDropdownProps, QBtnDropdownSlots } from 'quasar'

defineOptions({ name: 'ZBtnDropdown' })

const _ref = ref<QBtnDropdown>()
const _props = defineProps<QBtnDropdownProps & { tooltip?: string }>()
const _slots = defineSlots<Partial<QBtnDropdownSlots>>()

defineExpose({
  show: () => _ref.value?.show(),
  hide: () => _ref.value?.hide(),
  toggle: () => _ref.value?.toggle(),
})
</script>

<style scoped lang="postcss">
.z-btn-disabled {
  background-color: var(--q-tint);
  color: var(--q-tint); /* Tint over tint (it's a shade) */

  &.z-btn-flat {
    background-color: transparent;
    color: var(--q-text);
    opacity: 0.25 !important;
  }
}

:deep(.q-btn-dropdown__arrow) {
  border-left: 1px solid var(--q-shade);
}
</style>
