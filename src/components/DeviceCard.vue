<script setup>
import { computed } from 'vue'
import { device, link, ago, fmtDuration } from '../composables/useGarden'
import { t } from '../composables/useI18n'
import Icon from './Icon.vue'

const wifi = computed(() => {
  const r = device.rssi
  if (r === null) return { t: '—', s: 0 }
  if (r >= -55) return { t: `${t('dev.wifi.excellent')} (${r} dBm)`, s: 4 }
  if (r >= -67) return { t: `${t('dev.wifi.good')} (${r} dBm)`,      s: 3 }
  if (r >= -78) return { t: `${t('dev.wifi.weak')} (${r} dBm)`,      s: 2 }
  return { t: `${t('dev.wifi.veryWeak')} (${r} dBm)`, s: 1 }
})

const up = computed(() => {
  if (device.uptime === null) return '—'
  return fmtDuration(device.uptime)
})
</script>

<template>
  <div class="card">
    <div class="card-title"><span class="ti"><Icon name="chip" :size="15" /></span>{{ t('dev.title') }}</div>
    <dl>
      <div><dt>{{ t('dev.state') }}</dt><dd :class="device.online ? 'ok' : 'bad'">{{ device.online ? t('dev.online') : t('dev.offline') }}</dd></div>
      <div><dt>{{ t('dev.lastSeen') }}</dt><dd>{{ ago(device.lastSeen) }}</dd></div>
      <div><dt>{{ t('dev.wifi') }}</dt><dd>
        <span class="bars"><i v-for="n in 4" :key="n" :class="{ on: n <= wifi.s }"></i></span>
        {{ wifi.t }}
      </dd></div>
      <div><dt>{{ t('dev.uptime') }}</dt><dd>{{ up }}</dd></div>
      <div><dt>{{ t('dev.sensor') }}</dt><dd v-if="!device.seen">—</dd><dd v-else :class="device.fault ? 'bad' : 'ok'">{{ device.fault ? t('dev.sensor.fault') : t('dev.sensor.ok') }}</dd></div>
      <div><dt>{{ t('dev.raw') }}<small>{{ t('dev.raw.hint') }}</small></dt><dd class="num">{{ device.seen ? device.raw : '—' }}</dd></div>
      <div><dt>{{ t('dev.broker') }}</dt><dd :class="link.status === 'connected' ? 'ok' : 'bad'">{{ t('link.' + link.status) }}</dd></div>
    </dl>
  </div>
</template>

<style scoped>
dl { margin: 0; }
dl > div { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); padding: 11px 0; }
dl > div + div { border-top: 1px solid var(--hairline); }
dt { font-size: 13.5px; color: var(--muted); display: flex; flex-direction: column; }
dt small { font-size: 11px; color: var(--faint); margin-top: 1px; }
dd { margin: 0; font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.ok  { color: var(--leaf); }
.bad { color: var(--danger); }
.bars { display: inline-flex; align-items: flex-end; gap: 2px; height: 13px; }
.bars i { width: 3px; border-radius: 1px; background: var(--surface-3); }
.bars i:nth-child(1) { height: 4px; }
.bars i:nth-child(2) { height: 7px; }
.bars i:nth-child(3) { height: 10px; }
.bars i:nth-child(4) { height: 13px; }
.bars i.on { background: var(--leaf); }
</style>
