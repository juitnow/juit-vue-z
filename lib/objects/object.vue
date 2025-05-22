<template>
  <div>
    <z-object-header :label="label" :caption="caption">
      <template v-if="_slots.label" #label>
        <slot name="label" />
      </template>

      <template v-if="_slots.caption" #caption>
        <slot name="caption" />
      </template>

      <!-- button to hide or show the data -->
      <template #info>
        <q-icon
          name="sym_r_info"
          class="cursor-pointer"
          size="sm"
          @click="_showData = !_showData"
        />
        <q-icon
          name="sym_r_error_med"
          class="cursor-pointer"
          size="sm"
          @click="_showJson = !_showJson"
        />

        <!-- extra info buttons -->
        <slot name="more-info" />
      </template>

      <!-- === BUTTONS WHEN EDITING ======================================== -->
      <div class="row q-gutter-sm justify-end">
        <!-- === EXTRA CONTROLS BEFORE THE MAIN ONES ======================= -->

        <div v-if="_slots['controls-before']" class="col-shrink text-no-wrap">
          <slot name="controls-before" />
        </div>

        <!-- === MAIN CONTROLS ============================================= -->
        <div class="col-shrink text-no-wrap">
          <z-btn-group v-if="_editing">
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
              v-if="onSave"
              shrink="xs"
              color="positive"
              :disable="disabled || (!_submittable)"
              :icon="icons.confirm"
              :label="$t(translations.save)"
              @click="_submit"
            />
          </z-btn-group>

          <!-- === BUTTONS WHEN DELETED ==================================== -->

          <!-- Restore -->
          <z-btn
            v-else-if="_value.deleted && onRestore"
            shrink="xs"
            color="warning"
            :disable="disabled"
            :icon="icons.restore"
            :label="$t(translations.restore)"
            @click="_restore"
          />

          <!-- === BUTTONS WHEN VIEWING ==================================== -->

          <z-btn-group v-else>
            <!-- Delete -->
            <z-btn
              v-if="(! _value.deleted) && onDelete"
              shrink="xs"
              color="negative"
              :disable="disabled"
              :icon="icons.delete"
              :label="$t(translations.delete)"
              @click="_delete"
            />

            <!-- Extra Button (passed from parent component) -->
            <slot v-if="_slots.buttons" name="buttons" />

            <!-- Edit -->
            <z-btn
              v-if="onSave"
              shrink="xs"
              color="warning"
              :disable="disabled"
              :icon="icons.edit"
              :label="$t(translations.edit)"
              @click="_edit"
            />
          </z-btn-group>
        </div>

        <!-- === EXTRA CONTROLS AFTER THE MAIN ONES ======================== -->
        <div v-if="_slots['controls-after']" class="col-shrink text-no-wrap">
          <slot name="controls-after" />
        </div>
      </div>

      <!-- === EXTRA CONTROLS UNDER THE MAIN ONES ========================== -->
      <div v-if="_slots['controls-under']" class="row q-gutter-sm q-mt-sm justify-end">
        <div class="col-shrink" style="flex-basis: 75%">
          <slot name="controls-under" />
        </div>
      </div>

      <!-- === LISTICLE UNDER ALL CONTROLS ================================= -->
      <z-listicle v-if="_listicle" class="row justify-end q-mt-sm" :listicle="_listicle" />
    </z-object-header>

    <!-- ===== DIALOGS ===================================================== -->

    <!-- dialog to show the JSON content -->
    <z-dialog
      v-model="_showJson"
      title="JSON"
      full-width
      full-height
    >
      <q-card-section class="json-scroll">
        <pre>{{ JSON.stringify(_value, null, 2) }}</pre>
      </q-card-section>
    </z-dialog>

    <!-- object information (hidden by default) -->
    <z-dialog
      v-model="_showData"
      title="Info"
    >
      <q-card-section>
        <z-label
          minimal
          icon="sym_r_tag"
          :label="$t(translations['object.uuid'])"
          :value="_value.uuid.toUpperCase()"
        />
        <z-label
          minimal
          icon="sym_r_event_available"
          :label="$t(translations['object.created'])"
          :value="$d(_value.created, 'long')"
        />
        <z-label
          minimal
          icon="sym_r_event_note"
          :label="$t(translations['object.modified'])"
          :value="$d(_value.modified, 'long')"
        />
        <z-label
          v-if="_value.deleted"
          minimal
          icon="sym_r_event_busy"
          :label="$t(translations['object.deleted'])"
          :value="$d(_value.deleted, 'long')"
        />
      </q-card-section>
    </z-dialog>


    <!-- ===== FORM FIELDS ================================================= -->

    <z-form
      ref="_form"
      class="row q-col-gutter-md"
      bottom-slots
      :greedy="greedy"
      :editable="_editing"
      :disabled="disabled || loading"
      @submit.prevent.stop="_submit"
    >
      <slot name="default" />
    </z-form>
  </div>
</template>

<script setup lang="ts">
import { is, QCardSection, QIcon } from 'quasar'
import { computed, ref, toRaw, watch } from 'vue'

import { icons } from '../assets/icons'
import { translations } from '../assets/translations'
import ZBtnGroup from '../buttons/btn-group.vue'
import ZBtn from '../buttons/btn.vue'
import { useDialogs } from '../composition/dialogs'
import ZDialog from '../dialogs/dialog.vue'
import ZForm from '../forms/form.vue'
import ZLabel from '../inputs/label.vue'
import { getListicle } from '../utils/listicle'
import { createLoader } from '../utils/loader'
import ZListicle from './listicle.vue'
import ZObjectHeader from './object-header.vue'

import type { PropType, VNode } from 'vue'
import type { ZBaseObject } from '../types'

const { confirmDelete, confirmDiscard, confirmRestore } = useDialogs()

/* ===== NAME, PROPS, SLOTS & EMITS ========================================= */

defineOptions({ name: 'ZObject' })

const _props = defineProps({
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
  /** Enable "greedy" form validation */
  greedy: {
    type: Boolean,
    required: false,
    default: false,
  },

  /* ===== CUSTOMIZATIONS =================================================== */

  /**
   * Used as `@save="..."` in templates, saves an object.
   *
   * When this is not set, the _editability_ state is not managed (that is, the
   * "edit" and "save" buttons will not be shown) and the parent component must
   * manage editability itself.
   */
  onSave: {
    type: Function as PropType<(() => any) | undefined>,
    required: false,
    default: undefined,
  },
  /** Used as `@delete="..."` in templates, deletes an object */
  onDelete: {
    type: Function as PropType<(() => any) | undefined>,
    required: false,
    default: undefined,
  },
  /** Used as `@restore="..."` in templates, restores an object */
  onRestore: {
    type: Function as PropType<(() => any) | undefined>,
    required: false,
    default: undefined,
  },
})

/** The value of the object that will be edited, to check for modifications */
const _value = defineModel({
  type: Object as PropType<ZBaseObject>,
  required: true,
})

/** The editing state */
const _editing = defineModel('edit', {
  type: Boolean,
  required: false,
  default: false,
})

const _slots = defineSlots<{
  /** The components of the form for the object being viewed/edited */
  'default': () => VNode[]
  /** Label for the page title (optional, see also the `label` prop) */
  'label'?: () => VNode[],
  /** Caption for the page title (optional, see also the `caption` prop) */
  'caption'?: () => VNode[],
  /** Extra buttons to add when not editing */
  'buttons'?: () => VNode[],
  /** Additional content for the info section */
  'more-info'?: () => VNode[],
  /** Extra controls to add before the main ones */
  'controls-before'?: () => VNode[],
  /** Extra controls to add after the main ones */
  'controls-after'?: () => VNode[],
  /** Extra controls to add under the main ones */
  'controls-under'?: () => VNode[],
}>()

/* ===== STATE ============================================================ */

/** The backup copy of our object to check for difference/restore */
let _backup: ZBaseObject | undefined = undefined
/** Reference to our form for validation */
const _form = ref<InstanceType<typeof ZForm> | undefined>()

/** Flag indicating whether the object has been modified or not */
const _modified = computed(() => _editing.value && (! is.deepEqual(_value.value, _backup)))
/** Flag indicating that all *required* components have been filled */
const _ready = computed(() => _form.value?.isReady)
/** Flag indicating whether edits can be submitted back to the server */
const _submittable = computed(() => _modified.value && _ready)

/** Flag indicating whether we show or hide the fix input fields (uuid, created on...) */
const _showData = ref(false)
/** Flag indicating whether we show or hide the JSON source dialog */
const _showJson = ref(false)

/** The listicle, if associated with this object's UUID */
const _listicle = computed(() => getListicle(_value.value.uuid))

/* Changes to editability trigger value backup (can be triggered from outside) */
watch(_editing, (editing) => {
  if (editing) _backup = structuredClone(toRaw(_value.value))
  else _backup = undefined
}, { immediate: true })

/* ===== ACTIONS ============================================================ */

/** Loader fod delete/restore */
const { load, loading } = createLoader()

/** Edit object */
function _edit(): void {
  if (_editing.value !== true) _editing.value = true
}

/** Cancel and discard changes */
async function _cancel(): Promise<void> {
  if (_editing.value === false) return

  await load(async () => {
    if (! _modified.value) return _editing.value = false

    const result = await confirmDiscard()
    if (! result) return // no changes!
    // restore from backup and close editing
    _value.value = structuredClone(_backup!)
    _editing.value = false
  })
}

/** Validate, and if emit our "save" event */
async function _submit(): Promise<void> {
  if (! _props.onSave) return
  if (! _submittable.value) return
  const valid = await _form.value?.validate()
  if (valid) _props.onSave()
}

/** Delete this object */
async function _delete(): Promise<void> {
  if (_value.value.deleted) return

  await load(async () => {
    const result = await confirmDelete()
    if (result) _props.onDelete?.()
  })
}

/** Restore this object */
async function _restore(): Promise<void> {
  if (! _value.value.deleted) return

  await load(async () => {
    const result = await confirmRestore()
    if (result) _props.onRestore?.()
  })
}

/* ===== EXPOSED ============================================================ */

defineExpose({
  validate: async () => (await _form.value?.validate() || false),
  modified: _modified,
  submittable: _submittable,
  isReady: _ready,
})
</script>

<style lang="postcss" scoped>
.json-scroll {
  position: absolute;
  left: 0px;
  right: 0px;
  top: 64px;
  bottom: 0px;
  overflow: scroll;
}
</style>
