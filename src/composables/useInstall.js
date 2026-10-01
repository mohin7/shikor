/* PWA install helper.
   Android/desktop Chrome gives us a native prompt (beforeinstallprompt).
   iPhone Safari never does, so there we show the "Share → Add to Home Screen" steps. */
import { ref } from 'vue'

export const installed = ref(false)
export const installHelp = ref(false)
export const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

const standalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true
installed.value = standalone()

let deferred = null
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e })
window.addEventListener('appinstalled', () => { installed.value = true; deferred = null })

export async function install () {
  if (deferred) {
    deferred.prompt()
    try { await deferred.userChoice } catch { /* dismissed */ }
    deferred = null
    return
  }
  installHelp.value = true          // no native prompt: show the manual steps
}
