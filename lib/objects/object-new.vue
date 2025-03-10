<template>
  <div>
    <j-page-header :label="label" :caption="caption">
      <template v-if="_slots.label" #label>
        <slot name="label" />
      </template>
      <template v-if="_slots.caption" #caption>
        <slot name="caption" />
      </template>

      <z-btn-group>
        <!-- Cancel -->
        <z-btn
          shrink="xs"
          color="negative"
          :disable="disabled"
          :icon="icons.cancel"
          :label="$t(translations.cancel)"
          @click="_cancel"
        />

        <!-- Save -->
        <z-btn
          shrink="xs"
          color="positive"
          :disable="disabled || (!_submittable)"
          :icon="icons.confirm"
          :label="$t(translations.save)"
          @click="_submit"
        />
      </z-btn-group>
    </j-page-header>

    <z-form
      ref="_form"
      class="row q-col-gutter-md"
      bottom-slots
      editable
      :disabled="disabled"
      @submit.prevent.stop="_submit"
    >
      <slot name="default" />
    </z-form>
  </div>
</template>

<script lang="ts" setup>
import { is } from 'quasar'
import { computed, ref, toRaw } from 'vue'

import { icons } from '../assets/icons'
import { translations } from '../assets/translations'
import ZBtnGroup from '../buttons/btn-group.vue'
import ZBtn from '../buttons/btn.vue'
import ZForm from '../forms/form.vue'
import JPageHeader from './object-header.vue'

import type { PropType, VNode } from 'vue'

/* ===== NAME, PROPS, SLOTS & EMITS ========================================= */

defineOptions({ name: 'JObjectNew' })

const _props = defineProps({
  /** The object being created */
  value: {
    type: Object as PropType<Record<string, any> | undefined>,
    required: true,
  },
  /** Label for the page title (optional, see also the `label` slot) */
  label: {
    type: String,
    required: false,
    default: undefined,
  },
  /** Caption for the page title (optional, see also the `caption` slot) */
  caption: {
    type: String,
    required: false,
    default: undefined,
  },
  /** Disable all controls */
  disabled: {
    type: Boolean as PropType<boolean | undefined>,
    required: false,
    default: undefined,
  },
})

const _slots = defineSlots<{
  /** The components of the form for the object being viewed/edited */
  default: () => VNode[]
  /** Label for the page title (optional, see also the `label` prop) */
  label?: () => VNode[],
  /** Caption for the page title (optional, see also the `caption` prop) */
  caption?: () => VNode[],
}>()

const _emit = defineEmits<{
  /** Tell the parent component to save the object */
  (emit: 'save'): void
  /** Tell the parent component to cancel */
  (emit: 'cancel'): void
}>()

/* ===== STATE ============================================================== */

/** Backup of the `modelValue` to check for differences */
const _backup = structuredClone(toRaw(_props.value))
/** Reference to our form for validation */
const _form = ref<InstanceType<typeof ZForm> | undefined>()

/** Flag indicating whether the object has been modified or not */
const _modified = computed(() => ! is.deepEqual(_props.value, _backup))
/** Flag indicating whether edits can be submitted back to the server */
const _submittable = computed(() => _modified.value && _form.value?.isReady)

/* ===== ACTIONS ============================================================ */

/** Cancel and discard changes */
function _cancel(): void {
  _emit('cancel')
}

/** Validate, and if valid emit our "save" event */
async function _submit(): Promise<void> {
  if (! _submittable.value) return
  const valid = await _form.value?.validate()
  if (valid) _emit('save')
}
</script>
