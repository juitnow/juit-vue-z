<template>
  <z-dialog
    ref="dialog"
    persistent
    :title="title"
    @ok="emit('ok', $event)"
    @show="emit('show')"
    @hide="emit('hide')"
  >
    <slot v-if="slots.default" />
    <q-card-section v-else>
      {{ message }}
    </q-card-section>

    <q-card-actions>
      <z-btn
        class="col"
        :label="cancel || t({ en: 'Cancel', de: 'Abbrechen' })"
        :icon="cancelIcon"
        :color="cancelColor"
        @click="dialog?.cancel()"
      />
      <z-btn
        class="col"
        :label="confirm || t({ en: 'Confirm', de: 'Bestätigen' })"
        :icon="confirmIcon"
        :color="confirmColor"
        @click="dialog?.confirm()"
      />
    </q-card-actions>
  </z-dialog>
</template>

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { QCardActions, QCardSection } from 'quasar'
import { ref } from 'vue'

import { icons } from '../assets/icons'
import ZBtn from '../buttons/btn.vue'
import ZDialog from './dialog.vue'

import type { VNode } from 'vue'

const { t } = useTranslator()

defineOptions({ name: 'ZConfirmDialog' })

defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: false,
    default: '',
  },
  confirm: {
    type: String,
    required: false,
    default: undefined,
  },
  confirmIcon: {
    type: String,
    required: false,
    default: icons.confirm,
  },
  confirmColor: {
    type: String,
    required: false,
    default: 'positive',
  },
  cancel: {
    type: String,
    required: false,
    default: undefined,
  },
  cancelIcon: {
    type: String,
    required: false,
    default: icons.cancel,
  },
  cancelColor: {
    type: String,
    required: false,
    default: 'negative',
  },
})

const slots = defineSlots<{
  default?: () => VNode[]
}>()

const dialog = ref<InstanceType<typeof ZDialog>>()

/** Emits from the dialog */
const emit = defineEmits<{
  (event: 'ok', payload?: any): void
  (event: 'show'): void
  (event: 'hide'): void
}>()

defineExpose({
  show: () => dialog.value?.show(),
  shake: () => dialog.value?.shake(),
  confirm: (value?: any) => dialog.value?.confirm(value),
  cancel: () => dialog.value?.cancel(),
})
</script>
