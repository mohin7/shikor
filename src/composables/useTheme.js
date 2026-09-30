/* ==========================================================================
   useTheme — light by default, dark on request.
   The choice is remembered on this phone. The system setting is deliberately
   ignored: the app opens light until the user taps the moon.
   The inline script in index.html applies the saved theme before first paint,
   so there is no flash; this module keeps it in sync afterwards.
   ========================================================================== */

import { ref } from 'vue'

const KEY = 'shikor.theme.v1'

function load () {
  try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light' }
  catch { return 'light' }
}

export const theme = ref(load())

/* writes the attribute CSS listens to, and tints the browser / status bar */
export function applyTheme (value = theme.value) {
  const root = document.documentElement
  root.dataset.theme = value
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', value === 'dark' ? '#0A1310' : '#F3F6F1')
}

export function setTheme (value) {
  theme.value = value === 'dark' ? 'dark' : 'light'
  try { localStorage.setItem(KEY, theme.value) } catch { /* private mode */ }
  applyTheme(theme.value)
}

export function toggleTheme () {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}
