<script setup>
import { computed } from 'vue'
import { link, device, ago } from '../composables/useGarden'

const state = computed(() => {
  if (link.status === 'error')      return { k: 'bad',  t: 'সংযোগ ব্যর্থ' }
  if (link.status !== 'connected')  return { k: 'wait', t: 'যুক্ত হচ্ছে…' }
  if (!device.seen)                 return { k: 'wait', t: 'ডিভাইস খুঁজছি…' }
  if (!device.online)               return { k: 'bad',  t: 'ডিভাইস অফলাইন' }
  return { k: 'ok', t: 'অনলাইন' }
})
</script>

<template>
  <header class="bar">
    <div class="brand">
      <span class="mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="19" height="19">
          <path d="M12 21V11M12 11c0-4 3-7 8-7 0 5-3.4 8-8 8Zm0 2c0-3.3-2.6-6-6-6 0 4 2.6 6 6 6Z"
                fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="name">Shikor</span>
    </div>

    <div class="pill" :class="state.k">
      <i></i><span>{{ state.t }}</span>
    </div>
  </header>
</template>

<style scoped>
.bar {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 14px) var(--s-5) 12px;
  background: linear-gradient(180deg, var(--bg) 62%, transparent);
  backdrop-filter: blur(10px);
}
.brand { display: flex; align-items: center; gap: 9px; }
.mark { display: grid; place-items: center; color: var(--leaf); }
.name { font-size: 17px; font-weight: 700; letter-spacing: -.02em; }

.pill {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 600;
  padding: 5px 11px 5px 9px; border-radius: var(--r-pill);
  border: 1px solid var(--border); background: var(--surface);
  color: var(--muted);
}
.pill i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; flex: none; }
.pill.ok   { color: var(--leaf);   border-color: var(--leaf-line);   background: var(--leaf-wash); }
.pill.wait { color: var(--warn);   border-color: var(--warn-line);   background: var(--warn-wash); }
.pill.bad  { color: var(--danger); border-color: var(--danger-line); background: var(--danger-wash); }
.pill.wait i { animation: blink 1.1s ease-in-out infinite; }
@keyframes blink { 50% { opacity: .25; } }
</style>
