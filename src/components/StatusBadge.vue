<script setup>
/* Connection status, a small badge on the hero picture (right of the tap and plant).
   Online / Connecting / Offline. Purely informational; the reload button in the header retries. */
import { computed } from 'vue'
import { link, device } from '../composables/useGarden'
import { t } from '../composables/useI18n'

const state = computed(() => {
  if (link.status === 'error')      return { k: 'bad',  t: t('status.s.fail') }
  if (link.status !== 'connected')  return { k: 'wait', t: t('status.s.wait') }
  if (!device.seen)                 return { k: 'wait', t: t('status.s.wait') }
  if (!device.online)               return { k: 'bad',  t: t('status.s.bad') }
  return { k: 'ok', t: t('status.s.ok') }
})
</script>

<template>
  <div class="badge" :class="state.k" role="status">
    <i></i>
    <span class="txt">{{ state.t }}</span>
  </div>
</template>

<style scoped>
.badge {
  display: flex; align-items: center; gap: 6px; white-space: nowrap;
  padding: 4px 10px 4px 8px; pointer-events: none; border-radius: var(--r-pill);
  border: 1px solid var(--border); color: var(--muted);
  background: color-mix(in srgb, var(--surface) 84%, transparent);
  backdrop-filter: blur(6px); box-shadow: var(--shadow-sm);
}
.badge i { width: 7px; height: 7px; flex: none; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 18%, transparent); }
.txt { font-size: 11px; font-weight: 700; line-height: 1.2; }
.badge.ok   { color: var(--leaf);   border-color: var(--leaf-line); }
.badge.wait { color: var(--warn);   border-color: var(--warn-line); }
.badge.bad  { color: var(--danger); border-color: var(--danger-line); }
.badge.wait i { animation: blink 1.1s ease-in-out infinite; }
@keyframes blink { 50% { opacity: .25; } }
@media (prefers-reduced-motion: reduce) { .badge.wait i { animation: none; } }
</style>
