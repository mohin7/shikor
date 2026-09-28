<script setup>
import { computed } from 'vue'
import { history, device, clockTime } from '../composables/useGarden'

const W = 320, H = 130, PAD = 6

const pts = computed(() => history.value.slice(-60))

const path = computed(() => {
  const p = pts.value
  if (p.length < 2) return null
  const step = (W - PAD * 2) / (p.length - 1)
  const y = (s) => PAD + (H - PAD * 2) * (1 - Math.max(0, Math.min(100, s)) / 100)
  const line = p.map((d, i) => `${i ? 'L' : 'M'}${(PAD + i * step).toFixed(1)},${y(d.soil).toFixed(1)}`).join(' ')
  const area = `${line} L${(W - PAD).toFixed(1)},${H} L${PAD},${H} Z`
  return { line, area }
})

const lowY = computed(() => PAD + (H - PAD * 2) * (1 - device.low / 100))

const span = computed(() => {
  const p = pts.value
  if (p.length < 2) return ''
  return `${clockTime(p[0].t)} – ${clockTime(p[p.length - 1].t)}`
})
</script>

<template>
  <div class="card">
    <div class="between" style="margin-bottom:var(--s-4)">
      <div class="card-title" style="margin:0">আর্দ্রতার গতিপথ</div>
      <span class="span num">{{ span }}</span>
    </div>

    <div v-if="!path" class="empty">
      অ্যাপ খোলা রাখলে এখানে রিডিং জমতে থাকবে।
    </div>

    <svg v-else :viewBox="`0 0 ${W} ${H}`" class="chart" preserveAspectRatio="none">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="var(--leaf)" stop-opacity=".34" />
          <stop offset="100%" stop-color="var(--leaf)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <line v-for="g in [25,50,75]" :key="g"
            x1="0" :x2="W" :y1="PAD + (H - PAD*2) * (1 - g/100)" :y2="PAD + (H - PAD*2) * (1 - g/100)"
            stroke="var(--hairline)" stroke-width="1" />

      <line x1="0" :x2="W" :y1="lowY" :y2="lowY"
            stroke="var(--warn)" stroke-width="1.4" stroke-dasharray="4 4" opacity=".75" />

      <path :d="path.area" fill="url(#area)" />
      <path :d="path.line" fill="none" stroke="var(--leaf)" stroke-width="2.2"
            stroke-linejoin="round" stroke-linecap="round"
            vector-effect="non-scaling-stroke" />
    </svg>

    <div class="legend">
      <span><i class="l"></i>আর্দ্রতা</span>
      <span><i class="w"></i>শুকনো সীমা ({{ device.low }}%)</span>
    </div>
  </div>
</template>

<style scoped>
.chart { width: 100%; height: 130px; display: block; overflow: visible; }
.span { font-size: 11px; color: var(--faint); }
.empty {
  padding: 34px 0; text-align: center;
  font-size: 13px; color: var(--faint); line-height: 1.5;
}
.legend { display: flex; gap: var(--s-5); margin-top: var(--s-4); font-size: 11.5px; color: var(--muted); }
.legend span { display: flex; align-items: center; gap: 6px; }
.legend i { width: 14px; height: 2.5px; border-radius: 2px; }
.legend .l { background: var(--leaf); }
.legend .w { background: var(--warn); }
</style>
