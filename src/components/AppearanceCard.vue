<script setup>
import { t, lang, setLang } from '../composables/useI18n'
import { theme, setTheme } from '../composables/useTheme'
import Icon from './Icon.vue'
</script>

<template>
  <div class="card">
    <div class="card-title"><span class="ti"><Icon name="contrast" :size="15" /></span>{{ t('look.title') }}</div>

    <div class="row-set">
      <span class="lbl">{{ t('look.theme') }}</span>
      <div class="seg" role="group" :aria-label="t('look.theme')">
        <button :class="{ on: theme === 'light' }" :aria-pressed="theme === 'light'" @click="setTheme('light')">
          <Icon name="sun" :size="15" :stroke="1.9" />
          {{ t('look.light') }}
        </button>
        <button :class="{ on: theme === 'dark' }" :aria-pressed="theme === 'dark'" @click="setTheme('dark')">
          <Icon name="moon" :size="15" :stroke="1.9" />
          {{ t('look.dark') }}
        </button>
      </div>
    </div>

    <div class="row-set last">
      <span class="lbl">{{ t('look.lang') }}</span>
      <div class="seg" role="group" :aria-label="t('look.lang')">
        <button :class="{ on: lang === 'en' }" :aria-pressed="lang === 'en'" @click="setLang('en')">English</button>
        <button :class="{ on: lang === 'bn' }" :aria-pressed="lang === 'bn'" @click="setLang('bn')">বাংলা</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row-set {
  display: flex; align-items: center; justify-content: space-between; gap: var(--s-4);
  padding: 4px 0 var(--s-4);
}
.row-set.last { padding-bottom: 0; }
.row-set + .row-set { padding-top: var(--s-4); border-top: 1px solid var(--hairline); }
.lbl { font-size: 14px; font-weight: 600; color: var(--text-dim); }

.seg {
  display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 2px;
  padding: 3px; border-radius: var(--r-pill);
  background: var(--surface-3); border: 1px solid var(--border);
}
.seg button {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  min-width: 82px; padding: 7px 14px; border-radius: var(--r-pill);
  font-size: 13px; font-weight: 600; color: var(--muted);
  transition: background var(--t-base) var(--ease-out), color var(--t-base) var(--ease-out);
}
.seg button.on {
  background: var(--surface); color: var(--leaf);
  box-shadow: var(--shadow-sm), inset 0 0 0 1px var(--leaf-line);
}
.seg button:active { transform: scale(.96); }
</style>
