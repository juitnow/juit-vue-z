/* ========================================================================== *
 * HACK WARNING                                                               *
 * -------------------------------------------------------------------------- *
 * Microsoft's "Api Extractor" will happily remove all "declare module 'vue'" *
 * when bundling declaration files. So, we split this in two: we import (and  *
 * re-export untouched) our "globals.d.ts" file that auguments the Vue module *
 * and then simply export the definition bundled by "Api Extractor".          *
 * ========================================================================== */
import './lib/globals'
export * from './dist/index'
export * from './lib/globals'
