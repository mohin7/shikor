<script setup>
import { computed } from 'vue'
import { device, link, ago } from '../composables/useGarden'

const wifi = computed(() => {
  const r = device.rssi
  if (r === null) return { t: '—', s: 0 }
  if (r >= -55) return { t: `চমৎকার (${r} dBm)`, s: 4 }
  if (r >= -67) return { t: `ভালো (${r} dBm)`,   s: 3 }
  if (r >= -78) return { t: `দুর্বল (${r} dBm)`, s: 2 }
  return { t: `খুব দুর্বল (${r} dBm)`, s: 1 }
})

const up = computed(() => {
  if (device.uptime === null) return '—'
  const s = Math.floor(device.uptime)
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  if (h) return `${h} ঘণ্টা ${m} মিনিট`
  return `${m} মিনিট`
})
</script>

<template>
  <div class="card">
    <div class="card-title">ডিভাইস</div>
    <dl>
      <div><dt>অবস্থা</dt><dd :class="device.online ? 'ok' : 'bad'">{{ device.online ? 'অনলাইন' : 'অফলাইন' }}</dd></div>
      <div><dt>শেষ খবর</dt><dd>{{ ago(device.lastSeen) }}</dd></div>
      <div><dt>Wi-Fi সিগন্যাল</dt><dd>
        <span class="bars"><i v-for="n in 4" :key="n" :class="{ on: n <= wifi.s }"></i></span>
        {{ wifi.t }}
      </dd></div>
      <div><dt>চালু আছে</dt><dd>{{ up }}</dd></div>
      <div><dt>সেন্সর raw</dt><dd class="num">{{ device.seen ? device.raw : '—' }}</dd></div>
      <div><dt>ব্রোকার</dt><dd :class="link.status === 'connected' ? 'ok' : 'bad'">{{ link.status }}</dd></div>
    </dl>
  </div>
</template>

<style scoped>
dl { margin: 0; }
dl > div { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); padding: 11px 0; }
dl > div + div { border-top: 1px solid var(--hairline); }
dt { font-size: 13.5px; color: var(--muted); }
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
