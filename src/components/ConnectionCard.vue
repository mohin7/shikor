<script setup>
import { ref } from 'vue'
import { settings, saveSettings } from '../composables/useGarden'
import { t } from '../composables/useI18n'
import Icon from './Icon.vue'

const broker = ref(settings.broker)
const base   = ref(settings.base)
const saved  = ref(false)

function apply () {
  saveSettings({ broker: broker.value.trim(), base: base.value.trim().replace(/\/+$/, '') })
  saved.value = true
  setTimeout(() => (saved.value = false), 1600)
}
</script>

<template>
  <div class="card">
    <div class="card-title"><span class="ti water"><Icon name="link" :size="15" /></span>{{ t('conn.title') }}</div>

    <label class="f">
      <span>{{ t('conn.broker') }}</span>
      <input v-model="broker" spellcheck="false" autocapitalize="off" autocomplete="off">
    </label>

    <label class="f">
      <span>{{ t('conn.topic') }}</span>
      <input v-model="base" spellcheck="false" autocapitalize="off" autocomplete="off">
    </label>

    <p class="note">{{ t('conn.note') }}</p>

    <button class="apply" @click="apply">{{ saved ? t('conn.saved') : t('conn.apply') }}</button>
  </div>
</template>

<style scoped>
.f { display: block; margin-bottom: var(--s-4); }
.f span { display: block; font-size: 12.5px; color: var(--muted); margin-bottom: 7px; }
.f input {
  width: 100%; padding: 12px 14px; border-radius: var(--r-sm);
  background: var(--bg-elev); border: 1px solid var(--border);
  font-size: 13.5px; font-family: var(--num);
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}
.f input:focus { outline: none; border-color: var(--leaf); box-shadow: 0 0 0 3px var(--leaf-wash); }
.note { font-size: 11.5px; color: var(--faint); line-height: 1.55; margin-bottom: var(--s-4); }
.apply {
  width: 100%; padding: 13px 0; border-radius: var(--r-md);
  background: var(--surface-3); color: var(--text);
  border: 1px solid var(--border);
  font-size: 14px; font-weight: 600;
  transition: background var(--t-fast);
}
.apply:active { transform: scale(.98); }
</style>
