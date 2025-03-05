/* ========================================================================== *
 * SHARED TYPES                                                               *
 * ========================================================================== */

/** An address from `ZAddress` */
export interface ZAddressData {
  street_name?: string | undefined,
  house_number?: string | undefined,
  postal_code?: string | undefined,
  city?: string | undefined,
  country?: string | undefined,
}

/** An option from select components */
export interface ZOption {
  label: string,
  value: string,
}

/** A very basic object */
export interface ZBaseObject {
  uuid: string;
  created?: Date;
  modified?: Date;
  deleted?: Date;
}
