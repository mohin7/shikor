/* ==========================================================================
   useI18n — English by default, বাংলা on request.
   Strings live in src/i18n/en.js and bn.js under the same keys.
   In a template:  {{ t('home.dry', { soil: 2, low: 35 }) }}
   Because t() reads the reactive `lang`, everything re-renders on a switch.
   ========================================================================== */

import { ref } from 'vue'
import en from '../i18n/en'
import bn from '../i18n/bn'

const KEY = 'shikor.lang.v1'
const dictionaries = { en, bn }

function load () {
  try { return localStorage.getItem(KEY) === 'bn' ? 'bn' : 'en' }
  catch { return 'en' }
}

export const lang = ref(load())

export function applyLang (value = lang.value) {
  document.documentElement.lang = value
}

export function setLang (value) {
  lang.value = value === 'bn' ? 'bn' : 'en'
  try { localStorage.setItem(KEY, lang.value) } catch { /* private mode */ }
  applyLang(lang.value)
}

export function toggleLang () {
  setLang(lang.value === 'bn' ? 'en' : 'bn')
}

/* missing Bengali keys fall back to English, never to a blank */
export function t (key, params) {
  const text = dictionaries[lang.value][key] ?? dictionaries.en[key] ?? key
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? ''))
}
