<script setup>
import { computed } from 'vue'
import { device, actions, link, isWatering } from '../composables/useGarden'
import ToggleRow from './ToggleRow.vue'
import Icon from './Icon.vue'
import { t } from '../composables/useI18n'

const ready = computed(() => link.status === 'connected' && device.online)
</script>

<template>
  <div class="card">
    <div class="card-title"><span class="ti"><Icon name="auto" :size="15" /></span>{{ t('mode.title') }}</div>

    <ToggleRow
      icon="auto"
      :title="t('mode.auto.title')"
      :desc="device.auto ? t('mode.auto.on') : t('mode.auto.off')"
      :on="device.auto"
      :disabled="!ready"
      @toggle="device.auto ? actions.autoOff() : actions.autoOn()" />

    <details class="adv" :open="device.manual">
      <summary>{{ t('mode.advanced') }}</summary>
    <ToggleRow
      icon="power"
      :title="t('mode.manual.title')"
      :desc="t('mode.manual.desc')"
      tone="water"
      :on="device.manual"
      :disabled="!ready"
      @toggle="device.manual ? actions.manualOff() : actions.manualOn()" />

    <p v-if="device.manual" class="warn">
      <Icon name="alert" :size="16" />
      <span>{{ t('mode.manual.warn') }}</span>
    </p>
    </details>
  </div>
</template>

<style scoped>
.adv { margin-top: var(--s-2); border-top: 1px solid var(--hairline); }
.adv summary { list-style: none; cursor: pointer; padding: var(--s-3) 0 0; font-size: 12px; font-weight: 600; color: var(--faint); display: flex; align-items: center; gap: 6px; }
.adv summary::-webkit-details-marker { display: none; }
.adv summary::after { content: '›'; font-size: 16px; line-height: 1; transition: transform var(--t-fast); }
.adv[open] summary::after { transform: rotate(90deg); }
.warn svg { margin-top: 1px; }
.warn {
  display: flex; gap: 9px; align-items: flex-start;
  margin-top: var(--s-3); padding: 10px 12px;
  font-size: 12.5px; line-height: 1.4; color: var(--warn);
  background: var(--warn-wash); border: 1px solid var(--warn-line);
  border-radius: var(--r-sm);
}
</style>
