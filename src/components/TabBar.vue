<script setup>
import { t } from '../composables/useI18n'
import Icon from './Icon.vue'

const model = defineModel({ type: String, default: 'home' })
const tabs = [
  { id: 'home',     key: 'tab.home',     icon: 'home' },
  { id: 'history',  key: 'tab.history',  icon: 'history' },
  { id: 'settings', key: 'tab.settings', icon: 'settings' }
]
</script>

<template>
  <div class="dock">
  <nav class="tabs">
    <button v-for="tab in tabs" :key="tab.id"
            :class="{ on: model === tab.id }"
            :aria-current="model === tab.id ? 'page' : undefined"
            @click="model = tab.id">
      <span class="pill"><Icon :name="tab.icon" :size="21" :stroke="model === tab.id ? 2 : 1.7" /></span>
      <span class="lab">{{ t(tab.key) }}</span>
    </button>
  </nav>
  </div>
</template>

<style scoped>
.dock {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 40;
  max-width: 460px; margin: 0 auto;
  background: var(--bar-bg);
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  border-top: 1px solid var(--border);
  box-shadow: 0 -10px 30px -18px rgba(20, 50, 30, .25);
}
.tabs {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: var(--s-1);
  padding: 8px var(--s-4) calc(8px + env(safe-area-inset-bottom));
}
.tabs button {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 4px 0 2px; border-radius: var(--r-sm);
  color: var(--faint); font-size: 11px; font-weight: 600;
  transition: color var(--t-fast) var(--ease-out);
}
/* the icon sits in a soft capsule that fills in when its tab is active */
.pill {
  display: grid; place-items: center; width: 54px; height: 30px; border-radius: var(--r-pill);
  transition: background var(--t-base) var(--ease-out), transform var(--t-base) var(--ease-spring);
}
.tabs button.on { color: var(--leaf); }
.tabs button.on .pill { background: var(--leaf-wash); box-shadow: inset 0 0 0 1px var(--leaf-line); }
.tabs button:active .pill { transform: scale(.92); }
</style>
