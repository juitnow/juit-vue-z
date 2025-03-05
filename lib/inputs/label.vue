<template>
  <div class="z-input" :class="{ 'z-minimal-label': minimal }">
    <z-form-helper
      v-slot="formProps"
      :bottom-slots
      :disabled
    >
      <q-input
        :model-value="_value"

        dense
        readonly
        stack-label
        no-error-icon

        input-style="cursor: default"
        :class="((! minimal) && formProps.disabled) && 'z-state-disabled'"
        :outlined="! minimal"

        :placeholder=" minimal ? placeholder : undefined"
        :hint="hint"
        :bottom-slots="minimal ? false : formProps.bottomSlots"
        :hide-bottom-space="minimal ? true : ! formProps.bottomSlots"

        :label="label"
      >
        <template v-if="icon" #append>
          <!-- Links are enabled *only* when the containing form is not editable -->
          <template v-if="link && (! formProps.formEditable)">
            <!-- String links are rendered as anchors -->
            <a
              v-if="(typeof link === 'string')"
              :href="link"
              class="z-icon-link"
              @click.stop="() => {} /* q-input captures clicks and prevents default */"
            >
              <q-icon v-if="icon" class="z-icon z-icon-clickable" :name="icon" />
            </a>

            <!-- Object links are rendered as router links -->
            <router-link v-else :to="link" class="z-icon-link">
              <q-icon v-if="icon" class="z-icon z-icon-clickable" :name="icon" />
            </router-link>
          </template>

          <!-- Render the plain icon (not clickable) -->
          <q-icon v-else class="z-icon" :name="icon" />
        </template>
      </q-input>
    </z-form-helper>
  </div>
</template>

<script lang="ts" setup>
import { useTranslator } from '@juit/vue-i18n'
import { QIcon, QInput } from 'quasar'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import ZFormHelper from '../forms/form-helper.vue'

import type { PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

const { n, t } = useTranslator()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZLabel' })

const _props = defineProps({

  /** The value to display in this label */
  value: {
    type: [ String, Number, Boolean, null ] as PropType<string | number | boolean | null | undefined>,
    required: false,
    default: undefined,
  },

  /** Whether the label is minimalistic or not */
  minimal: {
    type: Boolean,
    required: false,
    default: false,
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
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
  },
  /** An optional link that will make the icon navigable */
  link: {
    type: [ Object, String ] as PropType<RouteLocationRaw | undefined>,
    required: false,
    default: undefined,
  },

  /* ===== MERGE WITH FORM PROPS ============================================ */

  /** Disabled state, overriding the editable and active states */
  disabled: {
    type: Boolean as PropType<boolean | undefined>,
    required: false,
    default: undefined,
  },

  /** Whether to reserve space for the bottom slots or not */
  bottomSlots: {
    type: Boolean as PropType<boolean | undefined>,
    required: false,
    default: undefined,
  },
})

const _value = computed(() => {
  if (_props.value === undefined) return ''
  if (_props.value === null) return ''

  if (typeof _props.value === 'boolean') {
    return _props.value ?
        t({ en: 'True', de: 'Wahr' }) :
        t({ en: 'False', de: 'Falsch' })
  }

  if (typeof _props.value === 'number') {
    return n(_props.value)
  }

  return _props.value
})

</script>

<style lang="postcss" scoped>
.z-minimal-label {
  :deep(.q-field__control) {
    background-color: transparent !important;
    padding-left: 6px;
    padding-right: 6px;

    &::before {
      border-top: 1px solid transparent !important;
      border-left: 1px solid transparent !important;
      border-right: 1px solid transparent !important;
    }
  }
}
</style>
