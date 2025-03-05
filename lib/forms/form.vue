<template>
  <z-input-group
    ref="_zinputs"
    :editable="editable"
    :disabled="disabled"
    :lazy-rules="lazyRules"
    :bottom-slots="bottomSlots"
  >
    <q-form ref="_qform" v-bind="{ ..._cleanProps, ...$attrs }">
      <!-- hidden button to allow submitting on "enter" -->
      <button type="submit" style="display: none;" />
      <!-- default slot from the parent -->
      <slot v-if="_slots.default" name="default" />
    </q-form>
  </z-input-group>
</template>

<script lang="ts" setup>
import { QForm } from 'quasar'
import { computed, onMounted, ref } from 'vue'

import { formProps } from '../utils/form'
import ZInputGroup from './input-group.vue'

import type { QFormProps, QFormSlots } from 'quasar'
import type { PropType } from 'vue'

/** Ref to our `QForm` */
const _qform = ref<QForm>()
/** Ref to our `ZInputGroup` */
const _zinputs = ref<InstanceType<typeof ZInputGroup>>()

/* ===== NAME, PROPS, SLOTS, EXPOSED ======================================== */

defineOptions({ name: 'ZForm' })

const _props = defineProps({
  // Pass-through for all QForm props (properly typed)
  ...QForm.props as { [ K in keyof QFormProps ]-?: PropType<QFormProps[K]> },
  // ZForm-specific props with defaults
  ...formProps,
})

const _slots = defineSlots<Partial<QFormSlots>>()

/* ===== LOCAL STUFF ======================================================== */

/** Cleaned-up props (without "bottomSlots", "editable", ...) */
const _cleanProps = computed(() => ({
  ..._props,
  bottomSlots: undefined,
  editable: undefined,
  disabled: undefined,
  lazyRules: undefined,
}))

defineExpose({
  focus: () => _qform.value?.focus(),
  validate: (shouldFocus?: boolean | undefined) => _qform.value ?
      _qform.value.validate(shouldFocus) :
      Promise.reject(new Error(('No QForm'))),
  resetValidation: () => _qform.value?.resetValidation(),
  submit: () => _qform.value?.submit(),
  reset: () => _qform.value?.reset(),
  getValidationComponents: () => _qform.value?.getValidationComponents(),
  isReady: computed(() => _zinputs.value?.isReady || false),
})

/* ===== SETUP ============================================================== */

/* Ensure the ZInputGroup ref is set */
onMounted(() => {
  if (! _zinputs.value) throw new Error('No ZInputGroup ref')
})
</script>
