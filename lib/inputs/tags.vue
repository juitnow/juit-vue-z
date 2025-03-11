<template>
  <div class="z-input">
    <z-form-helper
      v-slot="scope"
      :bottom-slots="bottomSlots"
      :disabled="disabled"
      :editable="editable"
      :lazy-rules="lazyRules"
      :readonly="readonly"
    >
      <q-select
        ref="_qselect"
        v-model="_value"

        dense
        outlined
        stack-label
        use-input
        use-chips
        multiple
        hide-dropdown-icon

        :class="
          scope.disabled ? 'z-state-disabled' :
          scope.editable ? 'z-state-editable' :
          'z-state-inactive'"

        :label="label"
        :hint="hint"
        :icon="icon"

        :bottom-slots="scope.bottomSlots"
        :disable="scope.disabled"
        :readonly="! scope.editable"

        :options="_options"
        :editable="true"
        :input-debounce="0"
        :new-value-mode="noNewValues ? undefined : 'add-unique'"
        :behavior="'menu'"

        @add="_add"
        @filter="_filter"
        @keydown="_onKeydown"
      >
        <template #append>
          <q-icon :name="icon" class="z-icon" />
        </template>

        <template #selected-item="data: Parameters<QSelectSlots['selected-item']>[0]">
          <z-tag
            :tag="data.opt"
            :removable="scope.editable && (! scope.disabled)"
            class="q-mr-xs"
            @remove="data.removeAtIndex(data.index)"
          />
        </template>

        <template #option="option: Parameters<QSelectSlots['option']>[0]">
          <q-item v-bind="option.itemProps" dense>
            <q-item-section>
              {{ option.label }}
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </z-form-helper>
  </div>
</template>

<script setup lang="ts">
import { QIcon, QItem, QItemSection, QSelect } from 'quasar'
import { onMounted, ref, shallowRef, watch } from 'vue'

import { icons } from '../assets/icons'
import ZFormHelper from '../forms/form-helper.vue'
import ZTag from '../tag.vue'
import { componentFormProps } from '../utils/form'

import type { QSelectSlots } from 'quasar'
import type { PropType } from 'vue'

/** Ref to our `QSelect` */
const _qselect = ref<QSelect>()

/* ===== NAME, PROPS, MODEL, ... ============================================ */

defineOptions({ name: 'ZTags' })

const _props = defineProps({

  /* ===== TAGS ============================================================= */

  /** The array of all known tags */
  tags: {
    type: Array as PropType<string[]>,
    required: false,
    default: () => [],
  },

  /* ===== FRILLS =========================================================== */

  /** The label for this input text */
  label: {
    type: String,
    required: false,
    default: 'Tags',
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
    required: false,
    default: icons.tag,
  },
  /** We don‘t accept new values, but only the existing ones (passed as tags) */
  noNewValues: {
    type: Boolean,
    required: false,
    default: false,
  },
  ...componentFormProps,
})

const _value = defineModel({
  type: Array as PropType<string[]>,
  required: false,
  default: () => [],
})

/* Exposed stuff */
defineExpose({
  /** Focus on this control */
  focus: () => _qselect.value?.focus(),
})

/* ===== STATE ============================================================== */

/** List of currently filtered tags */
const _options = shallowRef<readonly string[]>([])

/** All available tags, sorted alphabetically, lower cased */
const _tags = ref<string[]>([])
watch(() => _props.tags, (tags) => {
  _tags.value = tags.map((tag) => tag.toLowerCase()).sort()
}, { immediate: true })

/* ===== FUNCTIONS ========================================================== */

/**
 * Traps "Escape" to hide the popup (first) and clear the value (second) or
 * "Tab" to autocomplete.
 *
 * Quasar tracks "Escape" (and resets the input value) on "keyup"... This
 * happens only when the popup is shown (see below) so we intercept on key
 * down, and manually close the popup / wipe the input as needed.
 * https://github.com/quasarframework/quasar/blob/7182607ecac54c406c3cce595245d1bb1160024a/ui/src/components/select/QSelect.js#L639-L644
 */
function _onKeydown(event: KeyboardEvent): void {
  if (! _qselect.value) return // should never happen

  // no modifiers
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return

  // Handle "Tab" key (autocomplete)
  if (event.code === 'Tab') {
    if (! _options.value[0]) return // nothing to do
    const option = _options.value[0]

    if (_qselect.value.isOptionSelected(option)) return // already selected

    // select the first option on "Tab" and stop/prevent default on the event
    // as we want the user to potentially select multiple tags...
    _qselect.value.toggleOption(_options.value[0], false)
    event.preventDefault()
    event.stopPropagation()
    return
  }

  // Handle "Escape" key (close popup / clear value)
  if (event.code === 'Escape') {
    // if we have options, clear them and hide the popup
    if (_options.value.length > 0) {
      _options.value = []
    // if we have no options, clear the input
    } else {
      _qselect.value.updateInputValue('', true)
    }
    // regardless...
    _qselect.value.hidePopup()
    event.preventDefault()
    event.stopPropagation()
  }
}

/** Filters the tags according tu the current input */
function _filter(
    text: string,
    update: (filter: () => void, after?: (ref: QSelect) => void) => void,
    _abort: () => void,
): void {
  update(() => {
    // ran when the input changes: we filter all tags that match the input
    if (text.length < 1) return _options.value = Object.freeze([])

    const needle = text.toLowerCase() // _tags array is lower cased
    const options = _tags.value
        .filter((val) => val.indexOf(needle) >= 0) // anything matching text
        .filter((val) => _value.value.indexOf(val) < 0) // not already tagged
    _options.value = Object.freeze(options)
  }, (select) => {
    // ran when quasar updates the options: we focus on the first one
    if (text && select.options?.length) {
      select.setOptionIndex(-1) // i still don't understand precisely how it works
      select.moveOptionSelection(1, false) // but this focuses on the first option
    }
  })
}

/** When a new tag is added, we clear the input for the next tag */
function _add(_: { index: number, value: string }): void {
  _qselect.value?.updateInputValue('')
}

/* ===== SETUP ============================================================== */

/* Ensure the QSelect ref is set */
onMounted(() => {
  if (! _qselect.value) throw new Error('No QSelect ref')
})
</script>
