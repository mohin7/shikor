<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { ask, device, actions } from '../composables/useGarden'

const now = ref(Date.now())
let tick
onMounted(() => { tick = setInterval(() => (now.value = Date.now()), 1000) })
onUnmounted(() => clearInterval(tick))

/* the device cancels the request after 30 minutes */
const remain = computed(() => {
  const left = 30 * 60 - Math.floor((now.value - ask.at) / 1000)
  return Math.max(0, left)
})
const clock = computed(() => {
  const m = Math.floor(remain.value / 60), s = remain.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})
</script>

<template>
  <Transition name="sheet">
    <div v-if="ask.open" class="wrap">
      <div class="scrim" @click="actions.decline()"></div>
      <div class="sheet card">
        <div class="drop">💧</div>
        <h2>মাটি শুকিয়ে গেছে</h2>
        <p class="body">
          এখন আর্দ্রতা <b class="num">{{ ask.soil }}%</b>,
          তোমার ঠিক করা সীমা <b class="num">{{ ask.limit }}%</b>।
          এখনই পানি দেব?
        </p>
        <div class="timer num">উত্তর না দিলে {{ clock }} পরে অনুরোধ বাতিল হবে</div>
        <div class="btns">
          <button class="no" @click="actions.decline()">এখন না</button>
          <button class="yes" @click="actions.water(device.max)">
            হ্যাঁ, {{ device.max }}s দাও
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.wrap { position: fixed; inset: 0; z-index: 60; display: flex; align-items: flex-end; }
.scrim { position: absolute; inset: 0; background: rgba(4, 10, 8, .66); backdrop-filter: blur(6px); }
.sheet {
  position: relative; width: 100%;
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  border-bottom: none;
  padding: var(--s-6) var(--s-5) calc(var(--s-6) + env(safe-area-inset-bottom));
  box-shadow: var(--shadow-lg);
}
.drop { font-size: 34px; line-height: 1; margin-bottom: var(--s-3); }
h2 { font-size: 21px; font-weight: 700; letter-spacing: -.02em; }
.body { font-size: 14.5px; color: var(--text-dim); margin-top: 6px; line-height: 1.55; }
.body b { color: var(--text); }
.timer {
  margin-top: var(--s-4); font-size: 11.5px; color: var(--faint);
  padding: 8px 12px; background: var(--bg-elev);
  border: 1px solid var(--hairline); border-radius: var(--r-sm);
}
.btns { display: grid; grid-template-columns: 1fr 1.4fr; gap: var(--s-3); margin-top: var(--s-5); }
.btns button { padding: 15px 0; border-radius: var(--r-md); font-size: 15px; font-weight: 700; }
.btns button:active { transform: scale(.97); }
.no  { background: var(--surface-3); color: var(--text-dim); }
.yes { background: linear-gradient(180deg, var(--leaf-bright), var(--leaf-deep)); color: #06170E; box-shadow: var(--glow-leaf); }

.sheet-enter-active, .sheet-leave-active { transition: opacity var(--t-base) var(--ease-out); }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform var(--t-slow) var(--ease-spring); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
