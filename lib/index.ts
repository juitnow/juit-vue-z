// TODO import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'
// TODO import 'quasar/src/css/index.sass'

/* Buttons */
import ZBtnDropdown from './buttons/btn-dropdown.vue'
import ZBtnGroup from './buttons/btn-group.vue'
import ZBtn from './buttons/btn.vue'
/* Controls */
import ZControlDeleted from './controls/deleted.vue'
import ZControlDropdown from './controls/dropdown.vue'
import ZControlReload from './controls/reload.vue'
import ZControlSearch from './controls/search.vue'
import ZControlSwitch from './controls/switch.vue'
import ZControlToggle from './controls/toggle.vue'
/* Dialogs */
import ZConfirmDialog from './dialogs/confirm.vue'
import ZDialog from './dialogs/dialog.vue'
import ZProgressDialog from './dialogs/progress.vue'
/* Forms */
import ZFormHelper from './forms/form-helper.vue'
import ZForm from './forms/form.vue'
import ZInputGroup from './forms/input-group.vue'
/* Inputs */
import ZAddress from './inputs/address.vue'
import ZAutocomplete from './inputs/autocomplete.vue'
import ZDate from './inputs/date.vue'
import ZEan13 from './inputs/ean13.vue'
import ZLabel from './inputs/label.vue'
import ZNullableNumber from './inputs/nullable-number.vue'
import ZNumber from './inputs/number.vue'
import ZPassword from './inputs/password.vue'
import ZPicker from './inputs/picker.vue'
import ZSelect from './inputs/select.vue'
import ZString from './inputs/string.vue'
import ZTags from './inputs/tags.vue'
import ZText from './inputs/text.vue'
/* Objects */
import ZHeader from './objects/object-header.vue'
import ZObjectNew from './objects/object-new.vue'
import ZObject from './objects/object.vue'
/* Others */
import ZTable from './table/table.vue'
import ZTag from './tag.vue'
/* Local styles */
import './controls/zstyle.pcss'
import './inputs/zstyle.pcss'
// TODO import './zstyle.scss'

import type { App } from 'vue'

/* ========================================================================== *
 * COMPONENT TYPES                                                            *
 * ========================================================================== */

/* ===== BUTTONS ============================================================ */

export type ZBtn = InstanceType<typeof ZBtn>
export type ZBtnDropdown = InstanceType<typeof ZBtnDropdown>
export type ZBtnGroup = InstanceType<typeof ZBtnGroup>

/* ===== CONTROLS =========================================================== */

export type ZControlDeleted = InstanceType<typeof ZControlDeleted>
export type ZControlDropdown = InstanceType<typeof ZControlDropdown>
export type ZControlReload = InstanceType<typeof ZControlDeleted>
export type ZControlSearch = InstanceType<typeof ZControlDeleted>
export type ZControlSwitch = InstanceType<typeof ZControlDeleted>
export type ZControlToggle = InstanceType<typeof ZControlDeleted>

/* ===== DIALOGS ============================================================ */

export type ZConfirmDialog = InstanceType<typeof ZConfirmDialog>
export type ZDialog = InstanceType<typeof ZDialog>
export type ZProgressDialog = InstanceType<typeof ZProgressDialog>

/* ===== FORMS ============================================================== */

export type ZForm = InstanceType<typeof ZForm>
export type ZFormHelper = InstanceType<typeof ZFormHelper>
export type ZInputGroup = InstanceType<typeof ZInputGroup>

/* ===== INPUTS ============================================================= */

export type ZAddress = InstanceType<typeof ZAddress>
export type ZAutocomplete = InstanceType<typeof ZAutocomplete>
export type ZDate = InstanceType<typeof ZDate>
export type ZEan13 = InstanceType<typeof ZEan13>
export type ZLabel = InstanceType<typeof ZLabel>
export type ZNullableNumber = InstanceType<typeof ZNullableNumber>
export type ZNumber = InstanceType<typeof ZNumber>
export type ZPassword = InstanceType<typeof ZPassword>
export type ZPicker = InstanceType<typeof ZPicker>
export type ZSelect = InstanceType<typeof ZSelect>
export type ZString = InstanceType<typeof ZString>
export type ZTags = InstanceType<typeof ZTags>
export type ZText = InstanceType<typeof ZText>

/* ===== OBJECTS ============================================================ */

export type ZHeader = InstanceType<typeof ZHeader>
export type ZObject = InstanceType<typeof ZObject>
export type ZObjectNew = InstanceType<typeof ZObjectNew>

/* ===== OTHERS ============================================================= */

export type ZTag = InstanceType<typeof ZTag>

/* ========================================================================== *
 * INSTRUMENT VUE TYPES                                                       *
 * ========================================================================== */

declare module 'vue' {
  export interface GlobalComponents {

    /* ===== BUTTONS ======================================================== */

    /** Button */
    ZBtn: typeof ZBtn,
    /** Button Dropdown */
    ZBtnDropdown: typeof ZBtnDropdown,
    /** Button Group */
    ZBtnGroup: typeof ZBtnGroup,

    /* ===== CONTROLS ======================================================= */

    /** Show Deleted Control */
    ZControlDeleted: typeof ZControlDeleted,
    /** Dropdown */
    ZControlDropdown: typeof ZControlDropdown,
    /** Reload Control */
    ZControlReload: typeof ZControlReload,
    /** Search Control */
    ZControlSearch: typeof ZControlSearch,
    /** Switch Control */
    ZControlSwitch: typeof ZControlSwitch,
    /** Toggle Control */
    ZControlToggle: typeof ZControlToggle,

    /* ===== DIALOGS ======================================================== */

    /** Confirm Dialog */
    ZConfirmDialog: typeof ZConfirmDialog,
    /** Dialog */
    ZDialog: typeof ZDialog,
    /** Progress Dialog */
    ZProgressDialog: typeof ZProgressDialog,

    /* ===== FORMS ========================================================== */

    /** Form */
    ZForm: typeof ZForm,
    /** Form Helper */
    ZFormHelper: typeof ZFormHelper,
    /** Input group */
    ZInputGroup: typeof ZInputGroup,

    /* ===== INPUTS ========================================================= */

    /** Address input */
    ZAddress: typeof ZAddress,
    /** Autocomplete input */
    ZAutocomplete: typeof ZAutocomplete,
    /** Date input */
    ZDate: typeof ZDate,
    /** EAN13 input */
    ZEan13: typeof ZEan13,
    /** Label */
    ZLabel: typeof ZLabel,
    /** Nullable Number input */
    ZNullableNumber: typeof ZNullableNumber,
    /** Number input */
    ZNumber: typeof ZNumber,
    /** Password input */
    ZPassword: typeof ZPassword,
    /** Picker input */
    ZPicker: typeof ZPicker,
    /** Select input */
    ZSelect: typeof ZSelect,
    /** String input */
    ZString: typeof ZString,
    /** Tags input */
    ZTags: typeof ZTags,
    /** A simple text input (normally only used internally) */
    ZText: typeof ZText,

    /* ===== OBJECTS ======================================================== */

    /** Object header */
    ZHeader: typeof ZHeader,
    /** Object viewer/editor */
    ZObject: typeof ZObject,
    /** Object creator */
    ZObjectNew: typeof ZObjectNew,

    /* ===== OTHERS ========================================================= */

    /** Tag */
    ZTable: typeof ZTable,
    /** Tag */
    ZTag: typeof ZTag,

  }
}

/* ========================================================================== *
 * PLUGIN                                                                     *
 * ========================================================================== */

/* All our types */
export type * from './types'

/* All our assets */
export { icons } from './assets/icons'
export { translations } from './assets/translations'

export function juitWidgets(app: App): void {
  // buttons
  app.component('ZBtn', ZBtn)
  app.component('ZBtnDropdown', ZBtnDropdown)
  app.component('ZBtnGroup', ZBtnGroup)
  // controls
  app.component('ZControlDeleted', ZControlDeleted)
  app.component('ZControlDropdown', ZControlDropdown)
  app.component('ZControlReload', ZControlReload)
  app.component('ZControlSearch', ZControlSearch)
  app.component('ZControlSwitch', ZControlSwitch)
  app.component('ZControlToggle', ZControlToggle)
  // dialogs
  app.component('ZConfirmDialog', ZConfirmDialog)
  app.component('ZDialog', ZDialog)
  app.component('ZProgressDialog', ZProgressDialog)
  // forms
  app.component('ZForm', ZForm)
  app.component('ZFormHelper', ZFormHelper)
  app.component('ZInputGroup', ZInputGroup)
  // inputs
  app.component('ZAddress', ZAddress)
  app.component('ZAutocomplete', ZAutocomplete)
  app.component('ZDate', ZDate)
  app.component('ZEan13', ZEan13)
  app.component('ZLabel', ZLabel)
  app.component('ZNullableNumber', ZNullableNumber)
  app.component('ZNumber', ZNumber)
  app.component('ZPassword', ZPassword)
  app.component('ZPicker', ZPicker)
  app.component('ZSelect', ZSelect)
  app.component('ZString', ZString)
  app.component('ZTags', ZTags)
  app.component('ZText', ZText)
  // objects
  app.component('ZHeader', ZHeader)
  app.component('ZObject', ZObject)
  app.component('ZObjectNew', ZObjectNew)
  // others
  app.component('ZTable', ZTable)
  app.component('ZTag', ZTag)
}

/* ========================================================================== *
 * COMPOSABLES                                                                *
 * ========================================================================== */

export * from './composition/dialogs'
export * from './composition/validators'

/* ========================================================================== *
 * EXTRAS                                                                     *
 * ========================================================================== */

/* Form stuff */
export * from './utils/form'
/* Listicle stuff */
export * from './utils/listicle'
/* Loader stuff */
export * from './utils/loader'
/* Tables stuff */
export * from './utils/tables'
/* Location query management */
export * from './utils/query'
