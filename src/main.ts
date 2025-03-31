import { i18n } from '@juit/vue-i18n'
import { Notify } from 'quasar'
import { createApp } from 'vue'

// This must come before the "JuitWidgets" import
import '../lib/index.scss'
// All remaining imports
import '../lib/globals.d.ts'
import { JuitWidgets } from '../lib/index'
import Inputs from './inputs.vue'

// Create app
const myApp = createApp(Inputs)
myApp.use(i18n, { defaultLanguage: 'en-US' })
myApp.use(JuitWidgets, { plugins: { Notify } })
myApp.mount('#app')
