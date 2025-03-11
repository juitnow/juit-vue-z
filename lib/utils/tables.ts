import { useTranslator } from '@juit/vue-i18n'

import { translations } from '../assets/translations'

import type { PropType } from 'vue'
import type { ZBaseObject } from '../types'

/** Generic properties shared by all our tables. */
export const tableProps = {
  /** Make this compact (or not!) */
  dense: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Enclosed table: renders controls within the table itself */
  enclosed: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Can this table be expanded to full screen or not */
  fullscreen: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** The initial number of rows to be fetched (default: 25 when dense or 15) */
  length: {
    type: Number,
    required: false,
    default: ({ dense }: { dense?: boolean }) => dense ? 25 : 15,
  },
  /** Is the state of this table synchronized with the current route or not */
  useRoute: {
    type: Boolean,
    required: false,
    default: false,
  },
} as const

/**
 * Extra properties to add to tables to forward pointer events to the parent.
 *
 * The followings are **EMITS**, they need to be declared as props because
 * of the discussion at https://github.com/vuejs/rfcs/discussions/397.
 */
export const tableEventProps = {
  onRowClick: {
    type: Function as PropType<((event: PointerEvent, row: any, index: number) => void) | undefined>,
    required: false,
    default: undefined,
  },
  onRowDblclick: {
    type: Function as PropType<((event: PointerEvent, row: any, index: number) => void) | undefined>,
    required: false,
    default: undefined,
  },
  onRowContextmenu: {
    type: Function as PropType<((event: PointerEvent, row: any, index: number) => void) | undefined>,
    required: false,
    default: undefined,
  },
} as const

/** Table State */
export interface ZTableState {
  offset: number,
  limit: number,
  sort?: string | undefined,
  desc: boolean,
}

/** Describe a possible length of rows in a table */
export interface ZTableRowsOption {
  /** The _value_ (number of rows) associated with this option */
  value: number,
  /** The _icon_ (as per Quasar names) of the icon associated with this */
  icon: string,
}

/** Options defining row lengths in a table */
export type ZTableRowsOptions = ZTableRowsOption[]

/** A single column definition */
export interface ZTableColumn<T = any> {
  /** The label used in the header of the table */
  label: string | (() => string);
  /** The value to display in a cell for this column */
  value?: ((row: T) => any);
  /** Whether this column is hidden or not (`required` means _never_ hide) */
  hidden?: boolean | 'never';
  /** Horizontal alignment of cells in this column (default: `left`) */
  align?: 'left' | 'right' | 'center';
  /** A flag indicating whether this column is sortable and its default order */
  sortable?: boolean | 'asc' | 'desc';
  /** The real column where sorting will be performed (defaults to the key) */
  sort?: string;
  /** The style to apply on the data cells of this column */
  style?: string | ((row: T) => string);
  /** Classes to add to the data cells of this column */
  class?: string | ((row: T) => string);
}

/** Column definitions, keyed by table name */
export type ZTableColumns<T = any> = Record<string, ZTableColumn<T>>

/**
 * Objects columns definitions (`uuid`, `created`, `modifed` and `deleted`)
 *
 * Because of internationalization, we need to use this function directly in
 * the `setup()` function of the component, and never in computed properties.
 */
export function useObjectColumns(): ZTableColumns<ZBaseObject> {
  const { t, d } = useTranslator()

  return {
    uuid: {
      label: () => t(translations['object.uuid']),
      hidden: true,
    },
    created: {
      label: () => t(translations['object.created']),
      value: (row) => d(row.created),
      sortable: true,
      hidden: true,
    },
    modified: {
      label: () => t(translations['object.modified']),
      value: (row) => d(row.modified),
      sortable: true,
      hidden: true,
    },
    deleted: {
      label: () => t(translations['object.deleted']),
      value: (row) => d(row.deleted),
      sortable: true,
      hidden: true,
    },
  }
}
