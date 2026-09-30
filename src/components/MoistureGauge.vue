<script setup>
import { computed } from 'vue'
import { device, isWatering, soilColour, soilLabel } from '../composables/useGarden'
import { t } from '../composables/useI18n'

const R = 100
const FULL = 2 * Math.PI * R          // 628.3
const ARC  = FULL * 0.75              // 270° of sweep, gap at the bottom

const dash = computed(() => {
  const pct = Math.max(0, Math.min(100, device.seen ? device.soil : 0))
  return `${(ARC * pct) / 100} ${FULL}`
})

/* where the dry-threshold marker sits on the arc */
const markerAngle = computed(() => -225 + (device.low / 100) * 270)
</script>

<template>
  <div class="gauge" :class="{ watering: isWatering }">
    <svg viewBox="0 0 240 240" class="ring">
      <defs>
        <linearGradient id="gaugeGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   :stop-color="soilColour" stop-opacity=".55" />
          <stop offset="100%" :stop-color="soilColour" />
        </linearGradient>
      </defs>

      <!-- track -->
      <circle cx="120" cy="120" :r="R"
              fill="none" stroke="var(--surface-3)" stroke-width="14"
              stroke-linecap="round"
              :stroke-dasharray="`${ARC} ${FULL}`"
              transform="rotate(135 120 120)" />

      <!-- fill -->
      <circle cx="120" cy="120" :r="R"
              fill="none" stroke="url(#gaugeGrad)" stroke-width="14"
              stroke-linecap="round"
              :stroke-dasharray="dash"
              transform="rotate(135 120 120)"
              class="fill"
              v-show="device.seen && device.soil > 0" />

      <!-- dry threshold marker -->
      <line v-if="device.seen"
            x1="0" :y1="-R + 11" x2="0" :y2="-R - 11"
            stroke="var(--warn)" stroke-width="2.5" stroke-linecap="round"
            opacity=".85"
            :transform="`translate(120 120) rotate(${markerAngle})`" />
    </svg>

    <div class="readout">
      <div class="value num">
        <span class="n">{{ device.seen ? device.soil : '--' }}</span><span class="pct">%</span>
      </div>
      <div class="label">{{ soilLabel }}</div>
      <div class="raw num" v-if="device.seen">{{ t('gauge.raw') }} {{ device.raw }}</div>
    </div>
  </div>
</template>

<style scoped>
.gauge { position: relative; width: 216px; height: 216px; margin: 0 auto; }
.ring  { width: 100%; height: 100%; display: block; overflow: visible; }

.fill {
  transition: stroke-dasharray var(--t-slow) var(--ease-out);
}

.readout {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 2px;
}
.value { display: flex; align-items: baseline; gap: 2px; line-height: 1; }
.n     { font-size: 58px; font-weight: 700; letter-spacing: -.04em; }
.pct   { font-size: 21px; font-weight: 600; color: var(--muted); transform: translateY(-3px); }
.label { font-size: 15px; font-weight: 600; color: var(--text-dim); margin-top: 4px; }
.raw   { font-size: 11px; color: var(--faint); letter-spacing: .04em; }

/* while the pump runs the whole ring breathes */
.gauge.watering .ring { animation: breathe 2.2s ease-in-out infinite; }
@keyframes breathe {
  0%, 100% { filter: drop-shadow(0 0 0 transparent); }
  50%      { filter: drop-shadow(0 0 22px var(--water-line)); }
}
</style>
