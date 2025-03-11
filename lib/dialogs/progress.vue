<template>
  <z-dialog
    ref="_dialog"
    persistent
    :title="title"
    @show="_emit('show')"
    @hide="_emit('hide')"
  >
    <q-card-section class="row items-center justify-between">
      <div>{{ message }}</div>
      <div>{{ _progress }}</div>
    </q-card-section>

    <q-card-section>
      <q-linear-progress instant-feedback :value="_quantity" />
    </q-card-section>

    <q-card-actions v-if="onCancel">
      <z-btn
        class="col"
        color="negative"
        :label="t({ en: 'Cancel', de: 'Abbrechen' })"
        :icon="icons.cancel"
        :disable="_canceled"
        @click="_cancel()"
      />
    </q-card-actions>
  </z-dialog>
</template>

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { QCardActions, QCardSection, QLinearProgress } from 'quasar'
import { computed, ref } from 'vue'

import { icons } from '../assets/icons'
import ZBtn from '../buttons/btn.vue'
import ZDialog from './dialog.vue'

import type { PropType } from 'vue'

const { t } = useTranslator()

defineOptions({ name: 'JProgressDialog' })

const _props = defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    required: false,
    default: 0,
  },
  total: {
    type: Number as PropType<number>,
    required: false,
    default: 0,
  },
  onCancel: {
    type: Function as PropType<(() => void) | undefined>,
    required: false,
    default: undefined,
  },
})


const _canceled = ref(false)
const _dialog = ref<InstanceType<typeof ZDialog>>()

function _cancel(): void {
  if (!_props.onCancel) return
  _canceled.value = true
  _props.onCancel()
}

const _progress = computed(() => {
  if (_props.total) return `${_props.progress + 1} / ${_props.total}`
  return `${Math.round(_props.progress * 100)}%`
})

const _quantity = computed(() => {
  if (_props.total) return _props.progress / (_props.total - 1)
  return _props.progress
})

/** Emits from the dialog */
const _emit = defineEmits<{
  (event: 'show'): void
  (event: 'hide'): void
}>()

defineExpose({
  show: () => _dialog.value?.show(),
  hide: () => _dialog.value?.cancel(),
})

</script>
