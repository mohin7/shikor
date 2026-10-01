<script setup>
import { computed } from 'vue'
import { link, actions } from '../composables/useGarden'
import { t, lang, toggleLang } from '../composables/useI18n'
import { theme, toggleTheme } from '../composables/useTheme'
import { openGuide } from '../composables/useGuide'
import Icon from './Icon.vue'

const spinning = computed(() => link.status === 'connecting')

const isDark = computed(() => theme.value === 'dark')
</script>

<template>
  <header class="bar">
    <div class="brand">
      <span class="mark" aria-hidden="true"><Icon name="sprout" :size="18" :stroke="2" /></span>
      <span class="name">Shikor</span>
    </div>

    <div class="right">
      <button class="reload" @click="openGuide" :aria-label="t('guide.open')" :title="t('guide.open')">
        <Icon name="help" :size="17" />
      </button>

      <button class="reload" :class="{ spin: spinning }" @click="actions.refresh"
              :aria-label="t('status.reload')" :title="t('status.reload')">
        <Icon name="refresh" :size="16" />
      </button>

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

.reload {
  width: 32px; height: 32px; flex: none; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--surface); border: 1px solid var(--border); color: var(--text-dim);
  box-shadow: var(--shadow-sm);
}
.reload:active { transform: scale(.92); }
.reload.spin svg { animation: turn .9s linear infinite; }
@keyframes turn { to { transform: rotate(360deg); } }

</style>
