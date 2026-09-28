import { createApp } from 'vue'
import App from './App.vue'
import './styles/tokens.css'
import './styles/base.css'

createApp(App).mount('#app')

/* register the service worker so the app installs and opens offline-shell */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
