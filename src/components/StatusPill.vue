<script setup>
/* Connection status (Online / Device offline / Connecting…).
   Lives on the hero picture so the navbar can stay clean. */
import { computed } from 'vue'
import { link, device } from '../composables/useGarden'
import { t } from '../composables/useI18n'

const state = computed(() => {
  if (link.status === 'error')      return { k: 'bad',  t: t('status.failed') }
  if (link.status !== 'connected')  return { k: 'wait', t: t('status.connecting') }
  if (!device.seen)                 return { k: 'wait', t: t('status.searching') }
  if (!device.online)               return { k: 'bad',  t: t('status.offline') }
  return { k: 'ok', t: t('status.online') }
})
</script>

<template>
  <div class="pill" :class="state.k" role="status">
    <i></i><span>{{ state.t }}</span>
  </div>
</template>

<style scoped>
.pill {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 600; white-space: nowrap;
  padding: 5px 11px 5px 9px; border-radius: var(--r-pill);
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 84%, transparent);
  backdrop-filter: blur(6px); box-shadow: var(--shadow-sm);
  color: var(--muted);
}
.pill i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; flex: none; }
.pill.ok   { color: var(--leaf);   border-color: var(--leaf-line); }
.pill.wait { color: var(--warn);   border-color: var(--warn-line); }
.pill.bad  { color: var(--danger); border-color: var(--danger-line); }
.pill.wait i { animation: blink 1.1s ease-in-out infinite; }
@keyframes blink { 50% { opacity: .25; } }
@media (prefers-reduced-motion: reduce) { .pill.wait i { animation: none; } }

/* very narrow phones: keep the dot, drop the words */
@media (max-width: 359px) {
  .pill { padding: 8px; }
  .pill span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
}
</style>
