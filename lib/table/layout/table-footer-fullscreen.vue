<template>
  <z-btn
    flat
    dense
    :disable="disable"
    :size="dense ? 'sm' : 'md'"
    :icon="fullscreen ? icons.fullscreen.exit : icons.fullscreen.enter"
    :tooltip="$t({ en: 'Full screen', de: 'Ganzer Bildschirm' })"
    @click="fullscreen = ! fullscreen"
  />
</template>

<!-- ===========================================================================
| SETUP                                                                        |
============================================================================ -->

<script setup lang="ts">
import { icons } from '../../assets/icons'
import ZBtn from '../../buttons/btn.vue'

defineOptions({ name: 'ZTableFooterFullscreen' })

defineProps({
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
})

/** The full-screen state */
const fullscreen = defineModel({
  type: Boolean,
  required: true,
})
</script>
