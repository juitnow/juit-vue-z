<!--+ This is *exactly* the same as the standard Quasar QBtnGroup, but we apply
    | our default "unelevated" design (rather than constantly repeating...)
    +-->
<template>
  <q-btn-group v-bind="_props" unelevated>
    <slot v-if="_slots.default" name="default" />
  </q-btn-group>
</template>

<script setup lang="ts">
import { QBtnGroup } from 'quasar'

import type { QBtnGroupProps, QBtnGroupSlots } from 'quasar'

defineOptions({ name: 'ZBtnGroup' })

const _props = defineProps<QBtnGroupProps>()
const _slots = defineSlots<Partial<QBtnGroupSlots>>()
</script>
