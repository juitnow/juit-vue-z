<template>
  <div class="z-input">
    <z-form-helper
      v-slot="formProps"
      :bottom-slots="bottomSlots"
      :disabled="disabled"
      :editable="editable"
      :lazy-rules="lazyRules"
      :readonly="readonly"
    >
      <q-select
        ref="_qselect"
        :model-value="_selected"

        dense
        outlined
        stack-label
        use-input
        hide-selected
        fill-input

        no-error-icon
        hide-dropdown-icon

        :class="
          formProps.disabled ? 'z-state-disabled' :
          formProps.editable ? 'z-state-editable' :
          'z-state-inactive'"

        :label="label"
        :hint="hint"
        :icon

        :bottom-slots="formProps.bottomSlots"
        :hide-bottom-space="! formProps.bottomSlots"
        :disable="formProps.disabled"
        :readonly="! formProps.editable"
        :rules="_rules"

        :options="_options"
        :editable="true"
        :input-debounce="debounce"
        :behavior="'menu'"
        :loading="loading"

        @keydown="onKeydown"
        @input-value="_onInputValue"
        @popup-hide="_onPopupHide"
        @popup-show="_onPopupShow"
        @update:model-value="_onSelected"
      >
        <template #loading>
          <q-spinner color="grey" size="xs" />
        </template>

        <template v-if="maxLength && formProps.editable" #counter>
          {{ _input.length }} / {{ maxLength }}
        </template>

        <template #append>
          <!-- First icon, error -->
          <q-icon
            v-if="_qselect?.hasError"
            :name="icons.error"
            class="z-icon z-icon-error"
          />
          <!-- Second icon: clearable/required -->
          <q-icon
            v-if="formProps.editable && _selected && clearable"
            :name="icons.cancel"
            class="z-icon z-icon-clickable"
            @click.stop.prevent="_input = ''"
          />
          <q-icon
            v-else-if="(! _selected) && required"
            :name="icons.required"
            class="z-icon"
          />
          <!-- Icon from parent -->
          <q-icon
            v-if="icon"
            :name="icon"
            class="z-icon"
          />
        </template>

        <template #option="scope: Parameters<QSelectSlots['option']>[0]">
          <slot v-if="_slots.option" name="option" v-bind="scope" />
          <q-item v-else v-bind="scope.itemProps" dense>
            <q-item-section>
              {{ scope.label }}
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </z-form-helper>
  </div>
</template>

<script setup lang="ts">
import { QIcon, QItem, QItemSection, QSelect } from 'quasar'
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'

import { icons } from '../assets/icons'
import { useValidators } from '../composition/validators'
import ZFormHelper from '../forms/form-helper.vue'
import { componentFormProps } from '../utils/form'
import { createLoader } from '../utils/loader'

import type { QSelectSlots } from 'quasar'
import type { PropType, VNode } from 'vue'
import type { ZValidator } from '../composition/validators'
import type { ZOption } from '../types'

const validators = useValidators()

/** Ref to our `QSelect` */
const _qselect = ref<QSelect>()

/* ===== NAME, PROPS, MODEL, ... ============================================ */

defineOptions({ name: 'ZAutocomplete' })

const _props = defineProps({

  /* ===== FRILLS =========================================================== */

  /** The label for this input text */
  label: {
    type: String,
    required: true,
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

  /* ===== AUTOCOMPLETE ===================================================== */

  /** Debounce input for the specified amount of time (default: 250ms) */
  debounce: {
    type: Number,
    required: false,
    default: 250,
  },
  /**
   * Used as `@autocomplete="..."` in templates, prepares a list of otions
   * that can be auto-completed.
   *
   * When this method returns `string[]`, then the `@selected` event will
   * *not* be emitted (pure autocomplete). In order to have the `@selected`
   * even fired *always* return an array of `Option` objects, with unique
   * `value` properties.
   */
  onAutocomplete: {
    type: Function as PropType<(text: string) => (ZOption | string)[] | Promise<(ZOption | string)[]>>,
    required: true,
  },

  /* ===== OTHER OPTIONS ==================================================== */

  /** Clearable, when clicked value will become the empty string */
  maxLength: {
    type: Number as PropType<number>,
    required: false,
    default: 0,
  },
  /** Clearable, when clicked value will become the empty string */
  clearable: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Required */
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** The validation rules to apply to this field */
  rules: {
    type: Array as PropType<ZValidator<string>[]>,
    required: false,
    default: () => [],
  },

  ...componentFormProps,
})

const _slots = defineSlots<{
  option?: (scope: Parameters<QSelectSlots['option']>[0]) => VNode[],
}>()

/** The *text* value of the input */
const _input = defineModel({
  type: String as PropType<string >,
  required: false,
  default: '',
})

const _emit = defineEmits<{
  (event: 'selected', value: ZOption): void,
}>()

/* Exposed stuff */
defineExpose({
  /** Focus on this control */
  focus: () => _qselect.value?.focus(),
})

/* ===== INTERNAL STATE ===================================================== */

/** List of currently filtered tags */
const _options = shallowRef<readonly ZOption[]>([])

/** The validation rules to apply to this field */
const _rules = computed(() => {
  const rules: ZValidator<string>[] = []

  /* Required (from prop) */
  if (_props.required) rules.push(validators.required())
  /* Max length (from prop) */
  if (_props.maxLength > 0) rules.push(validators.maxLength(_props.maxLength))
  /* All other rules (from prop) */
  rules.push(..._props.rules)

  return [ (value?: ZOption | undefined) => {
    for (const rule of rules) {
      const result = rule(value?.label || '')
      if (typeof result === 'string') return result
      if (result === false) return false
    }
    return true
  } ]
})

/* ===== SELECTED VALUE ===================================================== */

/** Currently selected option */
const _selected = shallowRef<ZOption | undefined>(_input.value ? { label: _input.value, value: _input.value } : undefined)


/** Selected from the popup menu */
function _onSelected(option: ZOption): void {
  // remember this option and set the input value of the label
  _selected.value = option
  _input.value = option.label

  // If by any chance we have an autocompleter running, cancel it
  _autocompleter.cancel()

  // hide the popup, clear the options
  _qselect.value?.hidePopup()
  _options.value = []

  // emit the selected event
  _emit('selected', option)
}

/* ===== INPUT VALUE ======================================================== */

/* Update the text in our control based on what's out */
watch(_input, (value) => {
  _qselect.value?.updateInputValue(value, true)
  if (value) _selected.value = { label: value, value }
  else if (_selected.value) _selected.value = undefined
}, { immediate: true })

/** Update the model from the changes typed by the user  */
function _onInputValue(value: string): void {
  value = value.trim().replace(/\s+/g, ' ') // always normalize!

  // when we have no change, just bail out
  if (value === _input.value) return
  _input.value = value

  // QSelect validates on *selection*, but we validate on *input* (text)!
  _qselect.value?.validate() // validate the input

  // if the value is already in the options, we don't need to autocomplete: this
  // is someone going up-and-down the list with the cursor keys... but if it's
  // not in the list, then someone is typing and we need to autocomplete again!
  const found = _options.value.find((option) => option.label === value)
  if (! found) _autocomplete(value)
}


/* ===== STATE ============================================================== */

/** On popup hide, clear the options for the next autocomplete iteration */
function _onPopupHide(): void {
  _options.value = []
}

/** On popup show, simply focus on the first option available */
function _onPopupShow(): void {
  if (! _qselect.value?.options?.length) return // should never happen...
  _qselect.value?.setOptionIndex(-1)
  _qselect.value?.moveOptionSelection(1, true)
}

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
function onKeydown(event: KeyboardEvent): void {
  if (! _qselect.value) return // should never happen

  // no modifiers
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return

  // Handle "Escape" key (close popup / clear value)
  if (event.code === 'Escape') {
    // if we have options, clear them and hide the popup
    if (_options.value.length > 0) _qselect.value.hidePopup()
    else _input.value = ''

    // regardless...
    _qselect.value.hidePopup()
    event.preventDefault()
    event.stopPropagation()
  }
}

/* ===== AUTOCOMPLETE ======================================================= */

/** Loader and loading state for autocompletion */
const { load, loading } = createLoader(true) // detached from global loading

/**
 * A simple class asynchronously querying autocompletions and passing them to
 * our `QSelect` _unless_ its execution was canceled
 */
class Autocompleter {
  private _canceled = false

  constructor(public readonly text: string) {
    // Always start in the next tick, this gives us the chance to cancel!
    nextTick(() => load(async () => {
      // If canceled already, don't even fetch... This is important because the
      // initial autocompleter will be canceled immediately below, or when
      // "_onSelect()" and "_onInputValue()" are called, we don't know which
      // comes first, so we give them the ability to cancel each-other!
      if (this._canceled) return

      // Fetch the results and map them to options, then freeze the array
      const results = text ? await _props.onAutocomplete(text) : []
      const options = Object.freeze(results.map((option) => {
        if (typeof option === 'string') return { label: option, value: option }
        return option
      }))

      // If this was canceled (fetching might take time), then we ignore all
      // the rest and just ignore whatever results we got
      if (this._canceled) return

      // Immediately hide the popup if there are no options. If we don't call
      // this and just let the options be set to an empty array, then Quasar
      // will not emit the "hide" event and all sorts of bad will happen!
      if (options.length === 0) _qselect.value?.hidePopup()
      _options.value = options

      // On the next tick if and only if f there are options, show the popup
      nextTick(() => _qselect.value?.options?.length && _qselect.value?.showPopup())
    }))
  }

  /** Cancel this autocompleter */
  cancel(): this {
    this._canceled = true
    return this
  }
}

/**
 * The currently running asynchronous autocompleter.
 *
 * The initial value uses the input model value, but is immediately canceled
 * (so that we don't fetch at the beginning, but once the input changes we do)
 */
let _autocompleter: Autocompleter = new Autocompleter(_input.value).cancel()

/* Asynchronous filtering shows and hides the popup in Quasar, so rather than
 * using `@filter="..."` we take over the part of showing our autocompletion
 * options entirely */
function _autocomplete(text: string): void {
  // "Cancel" the previous autocompleter if it's still running
  _autocompleter.cancel()

  // If the current text matches the last autocomplete run, we ignore
  if (text === _autocompleter.text) return

  // And create a new one!
  _autocompleter = new Autocompleter(text)
}

/* ===== SETUP ============================================================== */

/* Ensure the QSelect ref is set */
onMounted(() => {
  if (! _qselect.value) throw new Error('No QSelect ref')
})
</script>
