<script setup>
const model = defineModel({ type: String, default: 'home' })
const tabs = [
  { id: 'home',    label: 'হোম',     d: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5' },
  { id: 'history', label: 'ইতিহাস',  d: 'M3 12a9 9 0 1 0 3-6.7M3 4v4h4M12 7.5V12l3 2' },
  { id: 'settings',label: 'সেটিংস',  d: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14.5H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.5a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1A1.6 1.6 0 0 0 10 1.7V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1' }
]
</script>

<template>
  <nav class="tabs">
    <button v-for="t in tabs" :key="t.id"
            :class="{ on: model === t.id }"
            @click="model = t.id">
      <svg viewBox="0 0 24 24" width="21" height="21">
        <path :d="t.d" fill="none" stroke="currentColor" stroke-width="1.7"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>{{ t.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.tabs {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 40;
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: var(--s-1);
  padding: 9px var(--s-4) calc(9px + env(safe-area-inset-bottom));
  background: rgba(10, 19, 16, .82);
  backdrop-filter: blur(20px) saturate(140%);
  border-top: 1px solid var(--hairline);
}
.tabs button {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 7px 0; border-radius: var(--r-sm);
  color: var(--faint); font-size: 11px; font-weight: 600;
  transition: color var(--t-fast) var(--ease-out);
}
.tabs button.on { color: var(--leaf); }
.tabs button:active { transform: scale(.94); }
</style>
