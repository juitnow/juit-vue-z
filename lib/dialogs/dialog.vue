<template>
  <q-dialog
    ref="dialogRef"
    v-model="state"
    :persistent="persistent"
    :full-width="fullWidth || $q.screen.lt.sm"
    :full-height="fullHeight"
    @show="emit('show')"
    @hide="emit('hide')"
  >
    <q-card class="q-dialog-plugin" :style="{ width: wide ? '100%' : null }">
      <q-card-section horizontal class="q-pa-md bg-shade-primary">
        <div class="col text-h6 text-bold text-uppercase">
          {{ title }}
        </div>
        <div v-if="! persistent" class="row justify-end">
          <q-card-actions vertical class="justify-around q-pa-none">
            <q-icon
              size="xs"
              color="primary"
              class="icon-close"
              :name="icons.cancel"
              @click="onDialogCancel"
            />
          </q-card-actions>
        </div>
      </q-card-section>

      <q-separator />

      <slot name="default" />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {
  QCard,
  QCardActions,
  QCardSection,
  QIcon,
  QSeparator,
  useDialogPluginComponent,
} from 'quasar'

import { icons } from '../assets/icons'

import type { VNode } from 'vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

defineOptions({ name: 'ZDialog' })

defineProps({
  /** The title of this dialog */
  title: {
    type: String,
    required: true,
  },
  /**
   * Indicates that this dialog can not be dismissed automatically (e.g.
   * by clicking outside of it, or with the `ESC` key)
   */
  persistent: {
    type: Boolean,
    default: false,
  },
  /** Present a wider dialog */
  wide: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  fullHeight: {
    type: Boolean,
    default: false,
  },
})

/** Showing state */
const state = defineModel({
  type: Boolean,
  required: false,
  default: false,
})

/** Emits from the dialog */
const emit = defineEmits<{
  (event: 'ok', payload?: any): void
  (event: 'show'): void
  (event: 'hide'): void
}>()

defineSlots<{
  default: () => VNode[]
}>()

defineExpose({
  show: () => dialogRef.value?.show(),
  shake: () => dialogRef.value?.shake(),
  confirm: onDialogOK,
  cancel: onDialogCancel,
})
</script>

<style scoped lang="pcss">
/* Hover effect for the close icon */
.icon-close {
  padding: 3px;
  cursor: pointer;
  margin-right: -3px;
  border-radius: 3px;

  &:hover {
    background-color: var(--q-shade-primary);
  }
}
</style>
