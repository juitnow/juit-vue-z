import { i18n } from '@juit/vue-i18n'
import { Notify } from 'quasar'
import { createApp } from 'vue'

// This must come before the "JuitWidgets" import
import '../lib/index.scss'
// All remaining imports
import '../lib/globals.d.ts'
import { JuitWidgets } from '../lib/index'
import App from './app.vue'

// Create app
const myApp = createApp(App)
myApp.use(i18n, { defaultLanguage: 'en-US' })
myApp.use(JuitWidgets, { plugins: { Notify } })
myApp.mount('#app')
