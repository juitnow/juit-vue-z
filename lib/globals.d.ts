import type {
  ZAddress,
  ZAutocomplete,
  ZBtn,
  ZBtnDropdown,
  ZBtnGroup,
  ZConfirmDialog,
  ZControlDeleted,
  ZControlDropdown,
  ZControlReload,
  ZControlSearch,
  ZControlSwitch,
  ZControlToggle,
  ZCountry,
  ZDate,
  ZDateRange,
  ZDialog,
  ZEan13,
  ZForm,
  ZFormHelper,
  ZHeader,
  ZInputGroup,
  ZLabel,
  ZNullableNumber,
  ZNumber,
  ZObject,
  ZObjectNew,
  ZPassword,
  ZPicker,
  ZProgressDialog,
  ZSelect,
  ZString,
  ZTable,
  ZTag,
  ZTags,
  ZTelephone,
  ZText,
} from './index'

interface ComponentConstructor<T> {
  new (): T;
}

/* ========================================================================== *
 * INSTRUMENT VUE TYPES                                                       *
 * ========================================================================== */

declare module 'vue' {
  export interface GlobalComponents {

    /* ===== BUTTONS ======================================================== */

    /** Button */
    ZBtn: ComponentConstructor<ZBtn>,
    /** Button Dropdown */
    ZBtnDropdown: ComponentConstructor<ZBtnDropdown>,
    /** Button Group */
    ZBtnGroup: ComponentConstructor<ZBtnGroup>,

    /* ===== CONTROLS ======================================================= */

    /** Show Deleted Control */
    ZControlDeleted: ComponentConstructor<ZControlDeleted>,
    /** Dropdown */
    ZControlDropdown: ComponentConstructor<ZControlDropdown>,
    /** Reload Control */
    ZControlReload: ComponentConstructor<ZControlReload>,
    /** Search Control */
    ZControlSearch: ComponentConstructor<ZControlSearch>,
    /** Switch Control */
    ZControlSwitch: ComponentConstructor<ZControlSwitch>,
    /** Toggle Control */
    ZControlToggle: ComponentConstructor<ZControlToggle>,

    /* ===== DIALOGS ======================================================== */

    /** Confirm Dialog */
    ZConfirmDialog: ComponentConstructor<ZConfirmDialog>,
    /** Dialog */
    ZDialog: ComponentConstructor<ZDialog>,
    /** Progress Dialog */
    ZProgressDialog: ComponentConstructor<ZProgressDialog>,

    /* ===== FORMS ========================================================== */

    /** Form */
    ZForm: ComponentConstructor<ZForm>,
    /** Form Helper */
    ZFormHelper: ComponentConstructor<ZFormHelper>,
    /** Input group */
    ZInputGroup: ComponentConstructor<ZInputGroup>,

    /* ===== INPUTS ========================================================= */

    /** Address input */
    ZAddress: ComponentConstructor<ZAddress>,
    /** Autocomplete input */
    ZAutocomplete: ComponentConstructor<ZAutocomplete>,
    /** Country selector */
    ZCountry: ComponentConstructor<ZCountry>,
    /** Date input */
    ZDate: ComponentConstructor<ZDate>,
    /** Date Range input */
    ZDateRange: ComponentConstructor<ZDateRange>,
    /** EAN13 input */
    ZEan13: ComponentConstructor<ZEan13>,
    /** Label */
    ZLabel: ComponentConstructor<ZLabel>,
    /** Nullable Number input */
    ZNullableNumber: ComponentConstructor<ZNullableNumber>,
    /** Number input */
    ZNumber: ComponentConstructor<ZNumber>,
    /** Password input */
    ZPassword: ComponentConstructor<ZPassword>,
    /** Picker input */
    ZPicker: ComponentConstructor<ZPicker>,
    /** Select input */
    ZSelect: ComponentConstructor<ZSelect>,
    /** String input */
    ZString: ComponentConstructor<ZString>,
    /** Tags input */
    ZTags: ComponentConstructor<ZTags>,
    /** Telephone input */
    ZTelephone: ComponentConstructor<ZTelephone>,
    /** A simple text input (normally only used internally) */
    ZText: ComponentConstructor<ZText>,

    /* ===== OBJECTS ======================================================== */

    /** Object header */
    ZHeader: ComponentConstructor<ZHeader>,
    /** Object viewer/editor */
    ZObject: ComponentConstructor<ZObject>,
    /** Object creator */
    ZObjectNew: ComponentConstructor<ZObjectNew>,

    /* ===== OTHERS ========================================================= */

    /** Tag */
    ZTable: ComponentConstructor<ZTable>,
    /** Tag */
    ZTag: ComponentConstructor<ZTag>,

  }
}
