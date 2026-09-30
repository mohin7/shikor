<script setup>
import { computed } from 'vue'
import { link, device } from '../composables/useGarden'
import { t, lang, toggleLang } from '../composables/useI18n'
import { theme, toggleTheme } from '../composables/useTheme'
import Icon from './Icon.vue'

const state = computed(() => {
  if (link.status === 'error')      return { k: 'bad',  t: t('status.failed') }
  if (link.status !== 'connected')  return { k: 'wait', t: t('status.connecting') }
  if (!device.seen)                 return { k: 'wait', t: t('status.searching') }
  if (!device.online)               return { k: 'bad',  t: t('status.offline') }
  return { k: 'ok', t: t('status.online') }
})

const isDark = computed(() => theme.value === 'dark')
</script>

<template>
  <header class="bar">
    <div class="brand">
      <span class="mark" aria-hidden="true"><Icon name="sprout" :size="18" :stroke="2" /></span>
      <span class="name">Shikor</span>
    </div>

    <div class="right">
      <button class="lang" @click="toggleLang" :aria-label="t('look.toLang')" :title="t('look.toLang')">
        <span :class="{ on: lang === 'en' }">EN</span>
        <span :class="{ on: lang === 'bn' }">বাং</span>
      </button>

      <button class="mode" :class="{ dark: isDark }" @click="toggleTheme"
              :aria-label="isDark ? t('look.toLight') : t('look.toDark')"
              :title="isDark ? t('look.toLight') : t('look.toDark')">
        <Icon class="moon" name="moon" :size="17" />
        <Icon class="sun" name="sun" :size="17" />
      </button>

      <div class="pill" :class="state.k" role="status">
        <i></i><span>{{ state.t }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.bar {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; justify-content: space-between; gap: var(--s-2);
  padding: calc(env(safe-area-inset-top) + 14px) var(--s-5) 12px;
  background: linear-gradient(180deg, var(--bg) 62%, transparent);
  backdrop-filter: blur(10px);
}
.brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
.mark {
  display: grid; place-items: center; width: 30px; height: 30px; border-radius: 10px;
  color: var(--leaf); background: var(--leaf-wash);
  box-shadow: inset 0 0 0 1px var(--leaf-line), var(--shadow-sm);
}
.name { font-size: 17px; font-weight: 700; letter-spacing: -.02em; }

.right { display: flex; align-items: center; gap: 6px; }

/* EN | বাং — both labels always visible, the active one lit */
.lang {
  display: flex; align-items: center; padding: 2px; height: 32px;
  border-radius: var(--r-pill);
  background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm);
  font-size: 11.5px; font-weight: 700; color: var(--muted);
}
.lang span {
  display: grid; place-items: center; min-width: 30px; height: 26px; padding: 0 6px;
  border-radius: var(--r-pill);
  transition: background var(--t-base) var(--ease-out), color var(--t-base) var(--ease-out);
}
.lang span.on { background: var(--leaf-wash); color: var(--leaf); box-shadow: inset 0 0 0 1px var(--leaf-line); }
.lang:active { transform: scale(.96); }

/* moon in light mode (tap to go dark), sun in dark mode (tap to go light) */
.mode {
  position: relative; width: 32px; height: 32px; flex: none;
  border-radius: 50%; display: grid; place-items: center;
  background: var(--surface); border: 1px solid var(--border); color: var(--text-dim);
  box-shadow: var(--shadow-sm);
}
.mode svg {
  position: absolute; inset: 0; margin: auto;
  transition: transform var(--t-slow) var(--ease-spring), opacity var(--t-base) var(--ease-out);
}
.mode .sun  { opacity: 0; transform: rotate(-70deg) scale(.6); }
.mode .moon { opacity: 1; transform: none; }
.mode.dark .sun  { opacity: 1; transform: none; }
.mode.dark .moon { opacity: 0; transform: rotate(70deg) scale(.6); }
.mode:active { transform: scale(.92); }

.pill {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 600; white-space: nowrap;
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

/* very narrow phones: keep the dot, drop the words */
@media (max-width: 374px) {
  .pill { padding: 8px; }
  .pill span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
}
</style>
