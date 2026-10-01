<script setup>
/* The hero of the Home tab: a pot of soil that shows what the sensor sees.
   - the dark "wet" layer rises and falls with the moisture reading
   - the plant droops below the dry limit and perks up as it gets wet
   - while the pump runs, drops fall from the tap and ripple on the soil
   - tap the scene to watch a single drop (visual only, never sends a command)
   The big number, label and raw reading that used to sit in the ring live
   in the top-left corner, so nothing was lost. */
import { computed, ref, onBeforeUnmount } from 'vue'
import { device, isWatering, soilColour, soilLabel, log, ago } from '../composables/useGarden'
import { t } from '../composables/useI18n'
import StatusBadge from './StatusBadge.vue'

const pct = computed(() => Math.max(0, Math.min(100, device.seen ? device.soil : 0)))

/* soil column: empty at y=200, full at y=136 */
const yFor = (p) => 200 - Math.max(0, Math.min(100, p)) * 0.64
const levelY = computed(() => yFor(pct.value))
const lowY    = computed(() => yFor(device.low))
const targetY = computed(() => yFor(device.target))

/* plant posture.  below the dry limit: droops up to ~55°.
   above it: relaxed leaves that stand straighter as the soil gets wetter. */
const thirsty = computed(() => device.seen && !device.fault && device.soil < device.low)
const leafAngle = computed(() => {
  if (!device.seen) return 30
  if (device.fault) return 30
  const low = Math.max(1, device.low)
  if (device.soil < low) return 14 + (1 - device.soil / low) * 44
  const span = Math.max(1, device.target - low)
  const wet = Math.min(1, (device.soil - low) / span)
  return 14 - wet * 12
})
const budScale = computed(() => (thirsty.value ? 0.78 : 1))

/* tap → one drop + a little sway of the plant and pot */
const shots = ref([])
const bump = ref(false)
let id = 0, bumpTimer = null
const timers = new Set()

function drip () {
  const k = ++id
  shots.value.push(k)
  const tm = setTimeout(() => { shots.value = shots.value.filter((x) => x !== k); timers.delete(tm) }, 1100)
  timers.add(tm)
  bump.value = false
  clearTimeout(bumpTimer)
  requestAnimationFrame(() => {
    bump.value = true
    bumpTimer = setTimeout(() => (bump.value = false), 900)
  })
  try { navigator.vibrate && navigator.vibrate(6) } catch { /* not everywhere */ }
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); clearTimeout(bumpTimer) })

const aria = computed(() =>
  device.seen ? `${soilLabel.value}, ${device.soil}%` : soilLabel.value)
</script>

<template>
  <div class="scene" :class="{ watering: isWatering, idle: !device.seen || device.fault }">
    <button class="stage" @click="drip" :aria-label="t('scene.tap')">
      <svg viewBox="0 0 300 230" class="art" role="img" :aria-label="aria" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="potBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   style="stop-color: var(--pot-rim)" />
            <stop offset="45%"  style="stop-color: var(--pot)" />
            <stop offset="100%" style="stop-color: var(--pot-shade)" />
          </linearGradient>
          <linearGradient id="dropFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   style="stop-color: var(--water); stop-opacity: .75" />
            <stop offset="100%" style="stop-color: var(--water)" />
          </linearGradient>
          <clipPath id="potInner">
            <path d="M170.5 131 H245.5 L237.4 198 Q237 202 233 202 H183 Q179 202 178.6 198 Z" />
          </clipPath>
        </defs>

        <!-- shelf + contact shadow -->
        <path d="M96 207 H300 V216 a4 4 0 0 1-4 4 H100 a4 4 0 0 1-4-4 Z" style="fill: var(--shelf)" />
        <ellipse cx="208" cy="207.5" rx="52" ry="4.2" fill="#000" opacity=".12" />

        <!-- tap: pipe from the top edge, bent head, nozzle -->
        <g class="tap">
          <rect x="228" y="-6" width="12" height="28" rx="3" style="fill: var(--border-strong)" />
          <rect x="228" y="-6" width="4" height="28" rx="2" fill="#fff" opacity=".25" />
          <rect x="220" y="19" width="28" height="15" rx="6" style="fill: var(--border-strong)" />
          <rect x="220" y="19" width="28" height="5" rx="2.5" fill="#fff" opacity=".22" />
          <rect x="230" y="33" width="8" height="6" rx="2" style="fill: var(--muted)" />
          <circle class="glint" cx="234" cy="41" r="3.4" style="fill: var(--water)" />
        </g>

        <!-- soil -->
        <g clip-path="url(#potInner)">
          <rect x="160" y="128" width="100" height="80" style="fill: var(--soil-dry)" />
          <g class="level" :style="{ transform: `translateY(${levelY}px)` }">
            <g class="wave back">
              <path d="M96 3 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 V90 H96 Z"
                    style="fill: var(--soil-wet)" opacity=".55" />
            </g>
            <g class="wave front">
              <path d="M96 5 q12 -4 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 V90 H96 Z"
                    style="fill: var(--soil-wet)" />
              <path d="M96 5 q12 -4 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0"
                    fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1.4" />
            </g>
          </g>
          <!-- crumbs of texture -->
          <g fill="#000" opacity=".12">
            <circle cx="182" cy="152" r="1.6" /><circle cx="226" cy="146" r="1.3" />
            <circle cx="198" cy="172" r="1.8" /><circle cx="236" cy="180" r="1.5" />
            <circle cx="214" cy="190" r="1.4" /><circle cx="186" cy="188" r="1.2" />
            <circle cx="240" cy="160" r="1.2" />
          </g>
        </g>

        <!-- plant -->
        <g class="sway" :class="{ go: bump }">
          <path d="M208 134 Q206.5 114 208 94" fill="none" stroke-width="3.4" stroke-linecap="round"
                class="stem" :class="{ dry: thirsty }" />
          <g class="lf" :style="{ transform: `rotate(${-leafAngle}deg)` }">
            <path d="M208 102 C195 103 185 95 182 82 C196 81 206 88 208 102 Z" class="leaf" :class="{ dry: thirsty }" />
          </g>
          <g class="lf" :style="{ transform: `rotate(${leafAngle}deg)` }">
            <path d="M208 102 C221 103 231 95 234 82 C220 81 210 88 208 102 Z" class="leaf" :class="{ dry: thirsty }" />
          </g>
          <g class="bud" :style="{ transform: `scale(${budScale}) rotate(${thirsty ? 26 : 0}deg)` }">
            <path d="M208 98 C201 90 202 78 208 68 C214 78 215 90 208 98 Z" class="leaf deep" :class="{ dry: thirsty }" />
          </g>
        </g>

        <!-- pot -->
        <g class="pot" :class="{ go: bump }">
          <path d="M166 130 H250 L241 200 Q240.5 206 234 206 H182 Q175.5 206 175 200 Z M170.5 131 H245.5 L237.4 198 Q237 202 233 202 H183 Q179 202 178.6 198 Z" fill="url(#potBody)" fill-rule="evenodd" />
          <path d="M166 130 H250 L249.3 136 H166.7 Z" fill="#000" opacity=".12" />
          <rect x="159" y="120" width="98" height="13" rx="5.5" style="fill: var(--pot-rim)" />
          <rect x="159" y="120" width="98" height="4.5" rx="2.2" fill="#fff" opacity=".28" />
        </g>
        <!-- soil, seen from the side of the rim, hides the plant's foot -->
        <ellipse cx="208" cy="133.6" rx="40" ry="2" fill="#000" opacity=".12" />

        <!-- threshold ticks, right of the pot: dry limit and target -->
        <g class="ticks">
          <line x1="259" :x2="272" :y1="lowY" :y2="lowY" stroke-width="2.4" stroke-linecap="round" style="stroke: var(--warn)" />
          <line x1="259" :x2="272" :y1="targetY" :y2="targetY" stroke-width="2.4" stroke-linecap="round" style="stroke: var(--leaf)" />
        </g>

        <!-- continuous drops while the pump runs -->
        <g v-if="isWatering" class="loop">
          <g v-for="n in 4" :key="'d' + n">
            <ellipse class="rip" cx="234" cy="133" rx="11" ry="2.6" :style="{ animationDelay: (n - 1) * 0.22 + 's' }" />
            <g class="drop" :style="{ animationDelay: (n - 1) * 0.22 + 's' }">
              <path d="M0 -6 C2.6 -2.4 4.6 0.2 4.6 2.4 A4.6 4.6 0 0 1 -4.6 2.4 C-4.6 0.2 -2.6 -2.4 0 -6 Z" fill="url(#dropFill)" />
              <ellipse cx="-1.6" cy="1.6" rx="1" ry="1.7" style="fill: var(--drop-hi)" />
            </g>
          </g>
          <!-- reduced-motion fallback: a steady thread of water instead of drops -->
          <rect class="thread" x="233" y="40" width="2" height="92" rx="1" style="fill: var(--water)" />
        </g>

        <!-- one-shot drops from a tap on the scene -->
        <g v-for="k in shots" :key="'s' + k" class="once">
          <ellipse class="rip" cx="234" cy="133" rx="11" ry="2.6" />
          <g class="drop">
            <path d="M0 -6 C2.6 -2.4 4.6 0.2 4.6 2.4 A4.6 4.6 0 0 1 -4.6 2.4 C-4.6 0.2 -2.6 -2.4 0 -6 Z" fill="url(#dropFill)" />
            <ellipse cx="-1.6" cy="1.6" rx="1" ry="1.7" style="fill: var(--drop-hi)" />
          </g>
        </g>
      </svg>
    </button>

    <!-- numbers: top-left, never intercept taps -->
    <div class="readout">
      <div class="chipline">
        <span class="dot" :style="{ background: soilColour }"></span>
        <span class="lbl">{{ soilLabel }}</span>
      </div>
      <div class="value num">
        <span class="n" :class="{ empty: !device.seen }">{{ device.seen ? device.soil : '--' }}</span><span class="pct">%</span>
      </div>
      <div class="raw" v-if="device.seen">{{ t('scene.moisture') }}</div>
    </div>

    <StatusBadge class="conn" />

    <div class="foot">
      <span v-if="isWatering" class="now"><i></i>{{ t('scene.watering') }}</span>
      <span v-else-if="log.length" class="hint">{{ t('scene.last', { time: ago(log[0].t) }) }}</span>
      <span v-else class="hint">{{ t('scene.tap') }}</span>
    </div>
  </div>
</template>

<style scoped>
.scene {
  position: relative; overflow: hidden;
  border-radius: var(--r-lg);
  border: 1px solid var(--border);
  background:
    radial-gradient(80% 70% at 78% 0%, var(--canopy-1), transparent 70%),
    linear-gradient(180deg, var(--sky-a), var(--sky-b));
  box-shadow: var(--card-edge), var(--shadow-md);
  transition: border-color var(--t-base), background var(--t-base);
}
.scene.watering { border-color: var(--water-line); }

.stage { display: block; width: 100%; padding: 0; cursor: pointer; -webkit-user-select: none; user-select: none; }
.art { display: block; width: 100%; height: auto; transition: filter var(--t-slow), opacity var(--t-slow); }
.scene.idle .art { filter: grayscale(.7); opacity: .7; }

/* ---- soil ------------------------------------------------------------- */
.level { transition: transform 1.4s var(--ease-out); }
.wave  { animation: drift 6s linear infinite; }
.wave.back { animation-duration: 9s; animation-direction: reverse; }
.scene.watering .wave { animation-duration: 2.6s; }
.scene.watering .wave.back { animation-duration: 4s; }
@keyframes drift { to { transform: translateX(-48px); } }

/* ---- plant ------------------------------------------------------------ */
.stem { stroke: var(--plant-deep); transition: stroke 1s; }
.stem.dry { stroke: var(--plant-wilt); }
.leaf { fill: var(--plant); transition: fill 1s; }
.leaf.deep { fill: var(--plant-deep); }
.leaf.dry { fill: var(--plant-wilt); }
.lf  { transform-origin: 208px 102px; transition: transform 1.3s var(--ease-spring); }
.bud { transform-origin: 208px 98px;  transition: transform 1.3s var(--ease-spring); }
.sway { transform-origin: 208px 134px; }
.sway.go { animation: sway .9s var(--ease-out); }
@keyframes sway { 0% { transform: rotate(0); } 25% { transform: rotate(-5deg); } 55% { transform: rotate(3.5deg); } 100% { transform: rotate(0); } }

.pot { transform-origin: 208px 206px; }
.pot.go { animation: squish .55s var(--ease-spring); }
@keyframes squish { 0% { transform: scale(1, 1); } 30% { transform: scale(1.025, .975); } 100% { transform: scale(1, 1); } }

.ticks line { opacity: .95; transition: all 1s var(--ease-out); }

/* ---- tap + drops ------------------------------------------------------- */
.glint { opacity: 0; transition: opacity var(--t-base); }
.scene.watering .glint { opacity: .9; }

.drop { opacity: 0; transform: translate(234px, 44px); }
.loop .drop { animation: fall .88s linear infinite; }
.once .drop { animation: fall .88s linear 1 both; }
@keyframes fall {
  0%   { transform: translate(234px, 44px)  scale(.4);       opacity: 0; animation-timing-function: ease-out; }
  12%  { transform: translate(234px, 50px)  scale(1);        opacity: 1; animation-timing-function: cubic-bezier(.5, 0, .95, .6); }
  88%  { transform: translate(234px, 130px) scale(.92, 1.2); opacity: 1; }
  100% { transform: translate(234px, 133px) scale(.4, .3);   opacity: 0; }
}

.rip {
  fill: none; stroke-width: 1.6; opacity: 0;
  stroke: var(--water);
  transform-box: fill-box; transform-origin: center;
}
.loop .rip { animation: ripple .88s linear infinite; }
.once .rip { animation: ripple .88s linear 1 both; }
@keyframes ripple {
  0%, 86% { opacity: 0; transform: scale(.2); }
  88%     { opacity: .75; transform: scale(.3); }
  100%    { opacity: 0; transform: scale(1.5); }
}

.thread { display: none; opacity: .5; }

/* ---- numbers ---------------------------------------------------------- */
.readout {
  position: absolute; left: var(--s-5); top: var(--s-5);
  display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
  pointer-events: none;
}
.chipline {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 4px 11px 4px 9px; border-radius: var(--r-pill);
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  box-shadow: inset 0 0 0 1px var(--border), var(--shadow-sm);
  backdrop-filter: blur(6px);
}
.dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.lbl { font-size: 12.5px; font-weight: 700; color: var(--text-dim); }
.value { display: flex; align-items: baseline; gap: 2px; line-height: 1; margin-top: 8px; }
.n   { font-size: 56px; font-weight: 700; letter-spacing: -.045em; }
.n.empty { color: var(--faint); }
.pct { font-size: 20px; font-weight: 600; color: var(--muted); transform: translateY(-3px); }
.raw { font-size: 12px; font-weight: 600; color: var(--muted); margin-top: 4px; }

.conn { position: absolute; right: 10px; bottom: 7px; }
.foot {
  position: absolute; left: var(--s-5); bottom: var(--s-4);
  pointer-events: none; font-size: 11.5px; font-weight: 600;
}
.hint { color: var(--faint); }
.now  { display: inline-flex; align-items: center; gap: 7px; color: var(--water); }
.now i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: pulse 1.1s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: .3; transform: scale(.7); } }

@media (max-width: 360px) { .n { font-size: 48px; } }

/* people who asked for less motion get a still picture and a steady thread of
   water while the pump runs: no falling drops, no drifting soil, no sway */
@media (prefers-reduced-motion: reduce) {
  .wave, .sway.go, .pot.go, .now i { animation: none !important; }
  .loop .drop, .loop .rip, .once { display: none; }
  .thread { display: block; }
  .level, .lf, .bud { transition: none; }
}
</style>
