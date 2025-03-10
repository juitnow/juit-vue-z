<template>
  <q-layout view="hHr LpR fFr">
    <q-page-container>
      <inputs />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { QLayout, QPageContainer } from 'quasar'

import Inputs from './inputs.vue'
</script>

<style scoped lang="css">
.q-page-container {
  margin-left: 20px;
  margin-right: 20px;
}
</style>
