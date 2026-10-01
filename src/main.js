import { createApp } from 'vue'
import App from './App.vue'
import './styles/tokens.css'
import './styles/base.css'
import { applyTheme } from './composables/useTheme'
import { applyLang } from './composables/useI18n'
import './composables/useInstall'   /* start listening for the install prompt early */

/* index.html already set both before first paint; this keeps the meta tags and
   the <html> attributes in step with the saved choice. */
applyTheme()
applyLang()

createApp(App).mount('#app')

/* register the service worker so the app installs and opens offline-shell */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
