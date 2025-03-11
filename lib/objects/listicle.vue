<template>
  <div>
    <!-- list -->
    <z-btn
      dense
      flat
      size="sm"
      class="z-listicle-control"
      icon="sym_r_list"
      :to="listicle.list"
    />

    <!-- page number -->
    <span class="q-px-sm text-no-wrap non-selectable">
      {{ $n(listicle.offset + 1) }}
      {{ $t({ en: ' of {n}', de: ' von {n}' }, { n: $n(listicle.length) }) }}
    </span>

    <!-- previous page -->
    <z-btn
      dense
      flat
      size="sm"
      class="z-listicle-control"
      :icon="icons.pagination.previous"
      :disable="!listicle.prev"
      :to="listicle.prev"
    />

    <!-- next page -->
    <z-btn
      dense
      flat
      size="sm"
      class="z-listicle-control"
      :icon="icons.pagination.next"
      :disable="!listicle.next"
      :to="listicle.next"
    />
  </div>
</template>

<script setup lang="ts">
import { icons } from '../assets/icons'
import ZBtn from '../buttons/btn.vue'

import type { PropType } from 'vue'
import type { ZListicle } from '../utils/listicle'

defineProps({
  listicle: {
    type: Object as PropType<ZListicle>,
    required: true,
  },
})
</script>
