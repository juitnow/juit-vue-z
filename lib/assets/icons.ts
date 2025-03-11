const showDeletedIcon = `
  M680,520 Q776,520 851.5,570.5 Q927,621 960,700 Q927,779 851.5,829.5 Q776,880 680,880
  Q584,880 508.5,829.5 Q433,779 400,700 Q433,621 508.5,570.5 Q584,520 680,520 z
  M680,600 Q621,600 570.5,627 Q520,654 490,700 Q520,746 570.5,773 Q621,800 680,800
  Q739,800 789.5,773 Q840,746 870,700 Q840,654 789.5,627 Q739,600 680,600 z
  M680,760 Q655,760 637.5,742.5 Q620,725 620,700 Q620,675 637.5,657.5
  Q655,640 680,640 Q705,640 722.5,657.5 Q740,675 740,700 Q740,725 722.5,742.5
  Q705,760 680,760 z M560,120 L400,120 Q383,120 371.5,131.5 Q360,143 360,160
  L200,160 Q183,160 171.5,171.5 Q160,183 160,200 Q160,217 171.5,228.5 Q183,240 200,240
  L200,760 Q200,793 223.5,816.5 Q247,840 280,840 L405.233,840
  C382.052,816.107 361.747,789.469 346.128,760 L280,760 L280,240 L680,240 L680,444
  C706.826,444.226 733.701,446.275 760,451.789 L760,240 Q777,240 788.5,228.5
  Q800,217 800,200 Q800,183 788.5,171.5 Q777,160 760,160 L600,160 Q600,143 588.5,131.5
  Q577,120 560,120 z M440,320 L360,320 L360,614.511 C381.9,581.303 408.463,551.141 440,526.721 L440,320 z
  M600,320 L520,320 L520,477.547 C545.413,465.601 572.563,457.493 600,451.789 L600,320 z
  @@ fill:currentColor
  | 0, 0, 960, 960`.replaceAll(/\s+/gm, ' ').trim()

/** Our very basic icons library */
export const icons = Object.freeze({
  /* actions */
  add: 'sym_r_add',
  cancel: 'sym_r_close',
  confirm: 'sym_r_check',
  delete: 'sym_r_delete',
  download: 'sym_r_download',
  duplicate: 'sym_r_list_alt_add',
  edit: 'sym_r_edit',
  logout: 'sym_r_move_item',
  print: 'sym_r_print',
  reload: 'sym_r_refresh',
  restore: 'sym_r_undo',
  search: 'sym_r_search',

  /* common types */
  barcode: 'sym_r_barcode',
  date: 'sym_r_calendar_today',
  error: 'sym_r_report', // should be "fill"
  language: 'sym_r_globe',
  menu: 'sym_r_menu',
  qrcode: 'sym_r_qr_code_2',
  required: 'sym_r_asterisk',
  select: 'sym_r_keyboard_double_arrow_down',
  tag: 'sym_r_sell',
  warning: 'sym_r_report',


  /** table controls */
  table: {
    columns: 'sym_r_table_chart',
    rows: 'sym_r_table_rows',
    row: {
      density: {
        1: 'sym_r_square',
        2: 'sym_r_bottom_sheets',
        3: 'sym_r_table_rows',
        4: 'sym_r_table_rows_narrow',
      },
    },
  },

  /** sorting */
  sorting: {
    descending: 'sym_r_south',
    ascending: 'sym_r_north',
    unsorted: 'sym_r_swap_vert',
  },

  /** pagination */
  pagination: {
    first: 'sym_r_first_page',
    previous: 'sym_r_chevron_left',
    next: 'sym_r_chevron_right',
    last: 'sym_r_last_page',
  },

  /** visibility */
  visibility: {
    on: 'sym_r_visibility',
    off: 'sym_r_visibility_off',
    deleted: showDeletedIcon, // visibility for "deleted" items
  },

  /** full screen */
  fullscreen: {
    enter: 'sym_r_zoom_out_map',
    exit: 'sym_r_zoom_in_map',
  },
} as const)
