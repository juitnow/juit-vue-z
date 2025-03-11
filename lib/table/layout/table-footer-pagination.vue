<template>
  <div class="row justify-center items-center" style="flex-wrap: nowrap;">
    <!-- first page -->
    <z-btn
      v-if="screen.gt.xs"
      flat
      dense
      :icon="icons.pagination.first"
      :size="dense ? 'sm' : 'md'"
      :disable="disable || (_page < 1)"
      @click="_page = 0"
    />

    <!-- previous page -->
    <z-btn
      flat
      dense
      :icon="icons.pagination.previous"
      :size="dense ? 'sm' : 'md'"
      :disable="disable || (_page < 1)"
      @click="_page -= 1"
    />

    <!-- page number -->
    <div class="q-px-sm text-no-wrap">
      {{ $n(_page + 1) }}
      <span v-if="last && screen.gt.xs" aria-disabled>
        {{ $t({ en: 'of {n}', de: 'von {n}' }, { n: _last }) }}
      </span>
    </div>

    <!-- next page -->
    <z-btn
      flat
      dense
      :icon="icons.pagination.next"
      :size="dense ? 'sm' : 'md'"
      :disable="disable || (! next)"
      @click="_page += 1"
    />

    <!-- last page -->
    <z-btn
      v-if="screen.gt.xs"
      flat
      dense
      :icon="icons.pagination.last"
      :size="dense ? 'sm' : 'md'"
      :disable="disable || ((last || 0) <= _page)"
      @click="_page = last"
    />
  </div>
</template>

<!-- ===========================================================================
| SETUP                                                                        |
============================================================================ -->

<script setup lang="ts">
import { useTranslator } from '@juit/vue-i18n'
import { useQuasar } from 'quasar'
import { computed } from 'vue'

import { icons } from '../../assets/icons'
import ZBtn from '../../buttons/btn.vue'

const { n, t } = useTranslator()
const { screen } = useQuasar()

defineOptions({ name: 'ZTableFooterPagination' })

const _props = defineProps({
  /** Make this compact (or not!) */
  dense: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Disable the control (for example, when loading) */
  disable: {
    type: Boolean,
    required: false,
    default: false,
  },
  /** Whether there is a _next_ page after the current one */
  next: {
    type: Boolean,
    required: true,
  },
  /** The last page, if any */
  last: {
    type: Number,
    required: true,
  },
})

/** The page number */
const _page = defineModel({
  type: Number,
  required: true,
})

/** Last, as a (formatted) number or the string "many" */
const _last = computed(() => {
  if (_props.last >= 0) return n(_props.last + 1)
  if (! _props.next) return n(_page.value + 1)
  return t({ en: 'many', de: 'viele' })
})


</script>
