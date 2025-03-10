<!--+ This is *exactly* the same as the standard Quasar QBtn, but we apply
    | our default "unelevated" design (rather than constantly repeating...)
    |
    | A couple of extra options are present:
    | - "shrink" to specify the screen size at which the button should shrink
    |   and presented *without* a label (the label will become a tooltip)
    | - "tooltip" to specify a tooltip to show on the button
    +-->
<template>
  <q-btn
    v-bind="{
      ...$attrs,
      ..._props,
      unelevated: true,
      shrink: undefined,
      tooltip: undefined
    }"
    :label="shrink ? $q.screen.gt[shrink] ? label : undefined : label"
    :color="disable ? undefined : color"
    :text-color="disable ? undefined : textColor"
    :class="{
      'z-btn-disabled': disable,
      'z-btn-flat': flat,
      'z-btn-default': (! flat) && (! color) && (!textColor),
    }"
  >
    <q-tooltip v-if="shrink && (! $q.screen.gt[shrink])" :delay="500">
      {{ label }}
    </q-tooltip>
    <q-tooltip v-else-if="tooltip" :delay="500">
      {{ tooltip }}
    </q-tooltip>

    <slot v-if="_slots.default" name="default" />
    <template v-if="_slots.loading">
      <slot name="loading" />
    </template>
  </q-btn>
</template>

<script setup lang="ts">
import { QBtn, QTooltip } from 'quasar'

import type { QBtnProps, QBtnSlots, Screen } from 'quasar'

type Shrink = keyof Screen['gt']

defineOptions({ name: 'ZBtn' })

const _props = defineProps<QBtnProps & { shrink?: Shrink, tooltip?: string }>()
const _slots = defineSlots<Partial<QBtnSlots>>()
</script>

<style scoped lang="postcss">
.z-btn-default {
  background-color: #80808040;
  color: var(--q-text);
}

.z-btn-disabled {
  background-color: var(--q-tint);
  color: var(--q-tint); /* Tint over tint (it's a shade) */

  &.z-btn-flat {
    background-color: transparent;
    color: var(--q-text);
    opacity: 0.25 !important;
  }
}
</style>
