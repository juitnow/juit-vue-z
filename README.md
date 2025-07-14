# Juit Widgets Library

This is the widget library used at [Juit GmbH](https://www.juit.com/) in our
internal tools.

While not meant for public release, someone might draw some inspiration from
how we built it.

It is heavily reliant on the [Quasar Framework](https://quasar.dev/) and our
[I18n Library](https://www.npmjs.com/package/@juit/vue-i18n).

And here is a little [demo](https://juitnow.github.io/juit-vue-z/).

* [License](LICENSE.md)
* [Copyright Notice](NOTICE.md)

### Usage

Import the library, and configure it using Quasar's own plugin options.

No need to import Quasar, styles, ... all is done for you!

```typescript
import { JuitWidgets } from '@juit/vue-z'
import { Loading, Notify } from 'quasar'
import { i18n } from '@juit/vue-i18n'

import { createApp } from 'vue'

const myApp = createApp(App)

myApp.use(i18n, { defaultLanguage: 'en-GB' })
myApp.use(JuitWidgets, {
  plugins: { Notify, Loading }, // Quasar plugins
})

myApp.mount('#app')
```

### Quick Demo

Simply run and point your browser to localhost:

```bash
npm run dev
```
