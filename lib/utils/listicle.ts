import { shallowRef } from 'vue'

import type { RouteLocationRaw } from 'vue-router'
import type { ZBaseObject } from '../types'

const listicle = shallowRef<{
  uuids: string[],
  list: RouteLocationRaw,
  link: (uuid: string) => RouteLocationRaw,
}>()

export interface ZListicle {
  offset: number;
  length: number;
  list: RouteLocationRaw;
  prev?: RouteLocationRaw;
  next?: RouteLocationRaw;
}

export function setListicle(
    objects: (ZBaseObject | string)[],
    location: RouteLocationRaw,
    link: (uuid: string) => RouteLocationRaw,
): void {
  const list = typeof location === 'string' ? location : { ...location }
  const uuids = objects.map((v) => typeof v === 'string' ? v : v.uuid)
  listicle.value = { link, list, uuids }
}

export function getListicle(uuid: string): ZListicle | undefined {
  if (! listicle.value) return undefined
  const { uuids, link, list } = listicle.value

  const offset = uuids.indexOf(uuid)
  if (offset === -1) return undefined

  const prev = uuids[offset - 1]
  const next = uuids[offset + 1]

  return {
    list,
    offset,
    length: uuids.length,
    prev: prev && link(prev),
    next: next && link(next),
  }
}
