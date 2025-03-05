<template>
  <z-text
    ref="_ztext"
    v-bind="$attrs"
    non-interactive

    :model-value="value"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :icon="icon"
    :link="link"

    :bottom-slots="bottomSlots"
    :editable="editable"
    :disabled="disabled"
    :readonly="readonly"

    :required="required"
    :on-clear="onClear"
    @click="_zdialog?.show()"
    @click-icon="_zdialog?.show()"
  >
    <template #append="formProps">
      <!-- Dialog for picking -->
      <z-dialog
        ref="_zdialog"
        v-model="_showing"
        wide
        :title="label"
        @ok="onOk"
        @show="onShow"
        @hide="onHide"
      >
        <q-card-section>
          <slot name="default" v-bind="formProps" />
        </q-card-section>
      </z-dialog>

      <template v-if="_slots.append">
        <slot name="append" v-bind="formProps" />
      </template>
    </template>
  </z-text>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import ZDialog from '../dialogs/dialog.vue'
import { componentFormProps } from '../utils/form'
import ZText from './text.vue'

import type { PropType, VNode } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { ZFormProps } from '../utils/form'

/** Ref to our `ZText` */
const _ztext = ref<InstanceType<typeof ZText>>()
/** Ref to our `QPopupProxy` */
const _zdialog = ref<InstanceType<typeof ZDialog>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZDate', inheritAttrs: false })

const _props = defineProps({

  /* The string value to display in the input field */
  value: {
    type: String,
    required: false,
    default: '',
  },

  /* ===== FRILLS =========================================================== */

  /** The label for this input text */
  label: {
    type: String,
    required: true,
  },
  /** The placeholder text when no input was entered */
  placeholder: {
    type: String,
    required: false,
    default: '',
  },
  /** The hint to display below the input field */
  hint: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
  },
  /** The icon to display within the control */
  icon: {
    type: String as PropType<string>,
    required: true,
  },
  /** An optional link that will make the icon navigable */
  link: {
    type: [ Object, String ] as PropType<RouteLocationRaw | undefined>,
    required: false,
    default: undefined,
  },

  /* ===== UTILITY PROPS ==================================================== */

  loading: {
    type: Boolean,
    required: false,
    default: false,
  },

  /** Indicates that the field is required (and errors when empty). */
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Used as `@clear="..."` in a template, to clear the text (and related) */
  onClear: {
    type: Function as PropType<(() => any) | undefined>,
    required: false,
    default: undefined,
  },

  ...componentFormProps,
})

/** The showing state of the dialog */
const _showing = defineModel({
  type: Boolean,
  required: false,
  default: false,
})

const _slots = defineSlots<{
  default?: (formProps: Readonly<ZFormProps>) => VNode[],
  append?: (formProps: Readonly<ZFormProps>) => VNode[]
}>()

const emit = defineEmits<{
  (event: 'ok', value?: any): void
  (event: 'show'): void
  (event: 'hide'): void
}>()

function onOk(value: any): void {
  emit('ok', value)
}

function onShow(): void {
  emit('show')
}

function onHide(): void {
  emit('hide')
  _ztext.value?.validate()
}

watch(() => _props.value, () => {
  nextTick(() => _ztext.value?.validate())
})

/* Exposed stuff */
defineExpose({
  /** Reset validation for this field */
  resetValidation: () => _ztext.value?.resetValidation(),
  /** Force validation of this field */
  validate: () => _ztext.value?.validate() || false,
  /** If the field has validation errors or not */
  hasError: computed(() => _ztext.value?.hasError || false),
  /** Show the picker dialog */
  show: () => _zdialog.value?.show(),
  /** Hide the picker dialog, confirming it with a value */
  confirm: (value?: any) => _zdialog.value?.confirm(value),
  /** Hide the picker dialog, cancelling it without a value */
  cancel: () => _zdialog.value?.cancel(),
  /** Hide the picker dialog */
  shake: () => _zdialog.value?.shake(),
})

/* ===== SETUP ============================================================== */

/* Ensure the ZText ref is set */
onMounted(() => {
  if (! _ztext.value) throw new Error('No ZText ref')
  if (! _zdialog.value) throw new Error('No QDialog ref')
})
</script>
