<template>
  <div class="z-input">
    <z-form-helper
      ref="_helper"
      v-slot="formProps"
      :bottom-slots="bottomSlots"
      :disabled="disabled"
      :editable="editable"
      :lazy-rules="lazyRules"
      :readonly="readonly"
    >
      <q-input
        ref="_qinput"

        dense
        outlined
        stack-label
        no-error-icon

        :class="`z-state-${_state}`"
        :input-style="{
          cursor: (_editable && onClick) ? 'pointer' : undefined,
          zIndex: '1', /* always stay above our suffix */
        }"

        :type="type"
        :label="label"
        :placeholder=" _editable ? placeholder : undefined"
        :hint="_editable ? hint : undefined"
        :counter="(_editable && formProps.bottomSlots) ? (maxLength > 0) : false"
        :maxlength="(_editable && (maxLength > 0)) ? maxLength : undefined"
        :bottom-slots="formProps.bottomSlots"
        :hide-bottom-space="! formProps.bottomSlots"
        :lazy-rules="formProps.lazyRules"
        :debounce="debounce"
        :readonly="_inactive || nonInteractive"
        :disable="_disabled"
        :rules="_rules"

        :model-value="_value"
        @update:model-value="_update"
      >
        <!-- Suffix, right behind the label, expanding with it -->
        <div v-if="_value && suffix" class="q-field__native z-suffix">
          <span class="z-suffix-hidden">{{ _value }}</span>
          <span class="z-suffix-visible">{{ suffix }}</span>
        </div>

        <template #append>
          <template v-if="_editable">
            <!-- First icon, error -->
            <q-icon
              v-if="_qinput?.hasError"
              :name="icons.error"
              class="z-icon z-icon-error"
            />

            <!-- Second icon, required or clearable -->
            <q-icon
              v-if="required && (! _value)"
              :name="icons.required"
              class="z-icon"
            />

            <q-icon
              v-else-if="_onClear"
              :name="icons.cancel"
              class="z-icon z-icon-clickable"
              @click="_onClear"
            />
          </template>

          <!-- Third icon: parent icon -->
          <template v-if="icon">
            <!-- The "onClickIcon" event is handled by the parent -->
            <template v-if="onClickIcon && formProps.editable">
              <q-icon
                v-if="icon"
                class="z-icon z-icon-clickable"
                :name="icon"
                @click.stop="onClickIcon"
              />
            </template>

            <!-- Links are enabled *only* when the containing form is not editable -->
            <template v-else-if="link && (! formProps.formEditable)">
              <!-- String links are rendered as anchors -->
              <a
                v-if="(typeof link === 'string')"
                :href="link"
                class="z-icon-link"
                @click.stop="() => {} /* q-input captures clicks and prevents default */"
              >
                <q-icon v-if="icon" class="z-icon z-icon-clickable" :name="icon" />
              </a>

              <!-- Icon when not editing (note even in the form), optionally linked somewhere -->
              <router-link v-else :to="link" class="z-icon-link">
                <q-icon v-if="icon" class="z-icon z-icon-clickable" :name="icon" />
              </router-link>
            </template>

            <!-- Icon w/o links -->
            <q-icon v-else class="z-icon" :name="icon" />
          </template>

          <!-- More stuff from the parent -->
          <slot v-if="_slots.append" name="append" v-bind="formProps" />
        </template>
      </q-input>
    </z-form-helper>
  </div>
</template>

<script setup lang="ts">
import { QIcon, QInput } from 'quasar'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { icons } from '../assets/icons'
import { useValidators } from '../composition/validators'
import ZFormHelper from '../forms/form-helper.vue'
import { componentFormProps, formReadyState } from '../utils/form'

import type { ValidationRule } from 'quasar'
import type { PropType, VNode } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { ZFormProps } from '../utils/form'

/* APPEARANCE: =================================================================
 *
 * The text input has fundamentally three "looks":
 *
 * - inactive: the field is visibly read-only, and user interaction is disabled
 * - editable: the field is editable, and it looks like it
 * - disabled: the field is visibly disabled, for example when loading data
 *
 * The default state is "inactive" (presented kind of like a label). The other
 * two states are controlled by the "editable", and "disabled" boolean
 * properties (in order of priority).
 *
 * This priority means that whenever "disabled" is "true", then "editable" is
 * de-facto ignored, and only when both "disabled" and "editable" are "false",
 * then the control is considered "inactive".
 *
 * The extra property "readonly" doesn't _visually_ change appearance of this
 * field, but can be used by wrappers of this component to present a different
 * experience. For example, in our date picker, the date can be displayed in
 * the field, but can only be picked by clicking on it (and can't be edited
 * with the keyboard, henceforth, readonly).
 *
 * ICONS: ======================================================================
 *
 * The text input can have a few icons:
 *
 * The first icon deals with validation, and is displayed when the field is
 * editable _and_ in error.
 *
 * The second icon deals with the "required" state of the field, and its
 * "clearability" (determined by the "onClear" property).
 *
 * - When "required" is "true" and the value is empty, we'll display a single
 *   asterisk indicating that a value is required.
 * - When "onClear" is set and the value is not empty, we'll display a "close"
 *   clickable icon that will invoke the "onClear" callback (up to the parent
 *   to determine how to clear the value).
 *
 * The third icon is the "action" icon, and will be displayed when the "icon"
 * property is set by the parent.
 */

const validators = useValidators()

/** Ref to our `QInput` */
const _qinput = ref<QInput>()
/** Ref to our `ZFormHelper` */
const _helper = ref<InstanceType<typeof ZFormHelper>>()

/* ===== NAME, PROPS, MODEL, EMITS, ... ===================================== */

defineOptions({ name: 'ZText' })

const _props = defineProps({

  /* ===== INPUT TYPE ======================================================= */

  /** The type of input to present: normal `text` or `password` */
  type: {
    type: String as PropType<'text' | 'password'>,
    required: false,
    default: 'text',
  },
  /** The virtual keyboard to use on mobile devices*/
  mode: {
    type: String as PropType<'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'>,
    required: false,
    default: 'text',
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

  /* ===== EXTRA STATE FOR SUB-COMPONENTS =================================== */

  /** The input looks editable, but text editing is disabled (for sub-components) */
  nonInteractive: {
    type: Boolean,
    required: false,
    default: false,
  },

  /* ===== UTILITY PROPS ==================================================== */

  /** The debounce time in milliseconds for the input field */
  debounce: {
    type: Number as PropType<number | undefined>,
    required: false,
    default: undefined,
  },
  /** The suffix to add to the input */
  suffix: {
    type: String as PropType<string>,
    required: false,
    default: '',
  },
  /** Keep the value "raw" (as in, do not normalize white spaces) */
  raw: {
    type: Boolean,
    required: false,
    default: false,
  },

  /* ===== VALIDATION ======================================================= */

  /** Indicates that the field is required (and errors when empty). */
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
  /**  The maximum length, displayed with a counter (and error when too long). */
  maxLength: {
    type: Number,
    required: false,
    default: 0,
  },
  /** The validation rules to apply to this field */
  rules: {
    type: Array as PropType<ValidationRule<string>[]>,
    required: false,
    default: () => [],
  },

  /* ===== EMITS AS PROPS =================================================== */

  /** Used as `@click="..."` in a template, when clicking on text field */
  onClick: {
    type: Function as PropType<((event: PointerEvent) => any) | undefined>,
    required: false,
    default: undefined,
  },
  /** Used as `@click-icon="..."` in a template, when clicking on icon */
  onClickIcon: {
    type: Function as PropType<((event: PointerEvent) => any) | undefined>,
    required: false,
    default: undefined,
  },
  /** Used as `@clear="..."` in a template, to clear the text (and related) */
  onClear: {
    type: Function as PropType<(() => any) | undefined>,
    required: false,
    default: undefined,
  },

  ...componentFormProps,
})

/** The value of the input */
const _value = defineModel({
  type: String,
  required: false,
  default: '',
})

/* Emits */
const _emit = defineEmits<{
  (emit: 'beforeinput', event: InputEvent): any
  (emit: 'blur', event: FocusEvent): any
  (emit: 'focus', event: FocusEvent): any
  (emit: 'input', event: InputEvent): any
  (emit: 'keydown', event: KeyboardEvent): any
  (emit: 'keyup', event: KeyboardEvent): any
}>()

/* Slots */
const _slots = defineSlots<{
  append?: (formProps: Readonly<ZFormProps>) => VNode[]
}>()

/* ===== INTERNAL STATE ===================================================== */

const _hasFocus = ref(false)

const _state = computed(() => {
  if (_helper.value?.isDisabled) return 'disabled'
  if (_helper.value?.isEditable) return 'editable'
  return 'inactive'
})

const _disabled = computed(() => _state.value === 'disabled')
const _editable = computed(() => _state.value === 'editable')
const _inactive = computed(() => _state.value === 'inactive')

function _update(value?: string | number | null): void {
  let string = typeof value === 'number' ? String(value) : (value || '')
  // trim and normalize spaces unless the "raw" prop is set
  if (! _props.raw) string = string.trim().replaceAll(/\s+/g, ' ')
  if (string !== _value.value) _value.value = string
}

/** Handle the clearability from the parent */
const _onClear = computed(() => {
  if (! _props.onClear) return undefined
  if (! _value.value) return undefined

  // Return a function setting the focus to the input *and* calling the
  // parent's "onClear" callback to wipe the value
  return () => {
    _qinput.value?.focus()
    _props.onClear?.()
  }
})

/* ===== INTERNAL STATE ===================================================== */

/* Exposed stuff */
defineExpose({
  /** Focus on this control */
  focus: () => _qinput.value?.focus(),
  /** Reset validation for this field */
  resetValidation: () => _qinput.value?.resetValidation(),
  /** Force validation of this field */
  validate: () => _qinput.value?.validate() || false,
  /** If the field has validation errors or not */
  hasError: computed(() => _qinput.value?.hasError || false),
  /** The native element of the input */
  nativeEl: computed(() => _qinput.value?.nativeEl as HTMLInputElement),
  /** A flag indicating whether this field is _editable_ or not */
  isEditable: _editable,
  /** A flag indicating whether this field is _disabled_ or not */
  isDisabled: _disabled,
  /** A flag indicating whether this field is _inactive_ or not */
  isInactive: _inactive,
  /** A flag indicating whether this field is _editable_ and _has focus_ or not */
  hasFocus: computed(() => _editable.value && _hasFocus.value),
})

/* ===== VALIDATION ========================================================= */

/* The validation rules */
const _rules = computed(() => {
  const rules: ValidationRule[] = []

  /* Required (from prop) */
  if (_props.required) rules.push(validators.required())
  /* Max length (from prop) */
  if (_props.maxLength > 0) rules.push(validators.maxLength(_props.maxLength))
  /* All other rules (from prop) */
  rules.push(..._props.rules)
  /* Quasar won't reset the validation status if the rules array is empty */
  if (rules.length === 0) rules.push(() => true)

  return rules
})

/* When editable or validation rules change, reset validation */
watch([ _editable, _rules ], () => _qinput.value?.resetValidation())

/* Ready state for parent ZForm */
formReadyState(() => {
  if (_qinput.value?.hasError) return false
  if (_props.required) return !! _value.value
  return true
})

/* ===== SETUP ============================================================== */

/* Pass-through events */
const _onBeforeinput = (event: InputEvent) => void _emit('beforeinput', event)
const _onBlur = (event: FocusEvent) => void _emit('blur', event)
const _onFocus = (event: FocusEvent) => void _emit('focus', event)
const _onInput = (event: Event) => void _emit('input', event as InputEvent) // follow MDN spec
const _onKeydown = (event: KeyboardEvent) => void _emit('keydown', event)
const _onKeyup = (event: KeyboardEvent) => void (_emit('keyup', event))

/** "onClick" is only passed through when enabled and we have a listener */
function _onClick(event: MouseEvent): void {
  if (_editable.value) _props.onClick?.(event as PointerEvent) // follow MDN spec
}

/** Extra event handler tracking "Escape" and clearing the content */
function _onKeydownClear(event: KeyboardEvent): void {
  if (! _props.onClear) return // no clear, no action
  const { key, altKey, ctrlKey, metaKey, shiftKey } = event
  if (altKey || ctrlKey || metaKey || shiftKey) return
  if (key !== 'Escape') return
  _props.onClear()
  event.preventDefault()
}

/** Extra event to handle focus state */
const _onFocusFocusable = () => void (_hasFocus.value = true)
const _onBlurFocusable = () => void (_hasFocus.value = false)

/** Add all our required event listeners */
function _addEventListeners(element?: HTMLInputElement | undefined): void {
  if (! element) return
  // Extra events for focus state: these _before_ the basic ones below, so that
  // "hasFocus" is set before any other event is handled by listeners
  element.addEventListener('focus', _onFocusFocusable)
  element.addEventListener('blur', _onBlurFocusable)
  // Setup basic event listeners
  element.addEventListener('beforeinput', _onBeforeinput)
  element.addEventListener('blur', _onBlur)
  element.addEventListener('click', _onClick)
  element.addEventListener('focus', _onFocus)
  element.addEventListener('input', _onInput)
  element.addEventListener('keydown', _onKeydown)
  element.addEventListener('keyup', _onKeyup)
  // Extra event for clearing input on "Escape": this goes _after_ the basic
  // ones so that anyone subscribed on "keydown" above can intercept the event
  // and stop propagation / prevent default / ...
  element.addEventListener('keydown', _onKeydownClear)
}

/** Remove all event listeners added above */
function _removeEventListeners(element?: HTMLInputElement | undefined): void {
  if (! element) return
  // Extra events for focus state
  element.removeEventListener('focus', _onFocusFocusable)
  element.removeEventListener('blur', _onBlurFocusable)
  // Setup basic event listeners
  element.removeEventListener('beforeinput', _onBeforeinput)
  element.removeEventListener('blur', _onBlur)
  element.removeEventListener('click', _onClick)
  element.removeEventListener('focus', _onFocus)
  element.removeEventListener('input', _onInput)
  element.removeEventListener('keydown', _onKeydown)
  element.removeEventListener('keyup', _onKeyup)
  // Extra event for clearing input on "Escape"
  element.removeEventListener('keydown', _onKeydownClear)
}

/* On mounted, validate our main ref and add event listeners */
onMounted(() => {
  if (! _qinput.value) throw new Error('No QInput ref')
  if (! _helper.value) throw new Error('No ZFormHelper ref')

  // We _watch_ but this should happen only once...
  watch(() => _qinput.value?.nativeEl, (newElement, oldElement) => {
    // Remove old event listeners and setup new ones (in case the element changes)
    _removeEventListeners(oldElement as HTMLInputElement)
    _addEventListeners(newElement as HTMLInputElement)
    // If we have a new element, set the input mode
    if (newElement) newElement.inputMode = _props.mode
  }, { immediate: true })
})

/* Before unmounting be nice and remove all our event listeners */
onBeforeUnmount(() => _removeEventListeners(_qinput.value?.nativeEl as HTMLInputElement))
</script>

<style lang="postcss" scoped>
/* Suffix behind the input */
.z-suffix {
  user-select: none;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  font-weight: 500;

  .z-suffix-hidden { color: transparent }
  .z-suffix-visible { opacity: 0.5 }
}
</style>
