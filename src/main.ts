import { i18n } from '@juit/vue-i18n'
import { createApp } from 'vue'

import { JuitWidgets } from '../lib/index'
import '../lib/index.scss'
import App from './app.vue'

// Create app
const myApp = createApp(App)
myApp.use(i18n, { defaultLanguage: 'en-US' })
myApp.use(JuitWidgets)
myApp.mount('#app')
