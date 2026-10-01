/* Shared state for the how-to guide: opened from the header, Home banner and Settings. */
import { ref } from 'vue'

const KEY = 'shikor.guide.seen.v1'
function read () { try { return localStorage.getItem(KEY) === '1' } catch { return false } }

export const guideOpen = ref(false)
export const guideSeen = ref(read())

export function openGuide () { guideOpen.value = true; markSeen() }
export function closeGuide () { guideOpen.value = false }
export function markSeen () {
  guideSeen.value = true
  try { localStorage.setItem(KEY, '1') } catch { /* private mode */ }
}
