/* ========================================================================== *
 * GIGANTIC HACK WARNING                                                      *
 * -------------------------------------------------------------------------- *
 * We need to import the SCSS and generated CSS files here because if we let  *
 * SASS do its thing (and import the CSS in it with an @import statement), it *
 * will simply generate an "@import" CSS statement atop of generated file:    *
 *                                                                            *
 * @import './dist/index.css';                                                *
 * @import './lib/index.scss';                                                *
 *                                                                            *
 * will generate the following                                                *
 *                                                                            *
 * @import './dist/index.css';                                                *
 * :root {                                                                    *
 *   ... the processed SCSS ...                                               *
 * }                                                                          *
 *                                                                            *
 * Then, when Vite picks this up, will prepend the CSS to the SCSS and we     *
 * won't be able to *override* the Quasar styles.                             *
 *                                                                            *
 * So, we let Vite do its thing, and leverage its bundling capabilities to    *
 * *FIRST* do the Quasar SASS madness, and *AFTER* override the styles with   *
 * our own.                                                                   *
 * ========================================================================== */

// This must be *BEFORE* the import of the CSS file
import './dist/index.scss'
// This must be *AFTER* the import of the SCSS file
import './dist/index.css'

// Simple exports...
export * from './dist/index.js'
