<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { ask, device, actions } from '../composables/useGarden'
import { t } from '../composables/useI18n'
import Icon from './Icon.vue'

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
        <div class="drop"><Icon name="drop" :size="26" fill /></div>
        <h2>{{ t('ask.title') }}</h2>
        <p class="body">
          {{ t('ask.pre') }}<b class="num">{{ ask.soil }}%</b>{{ t('ask.mid') }}<b class="num">{{ ask.limit }}%</b>{{ t('ask.post') }}
        </p>
        <div class="timer num">{{ t('ask.timer', { clock }) }}</div>
        <div class="btns">
          <button class="no" @click="actions.decline()">{{ t('ask.no') }}</button>
          <button class="yes" @click="actions.water(device.max)">
            {{ t('ask.yes', { n: device.max }) }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.wrap { position: fixed; inset: 0; z-index: 60; display: flex; align-items: flex-end; }
.scrim { position: absolute; inset: 0; background: var(--scrim); backdrop-filter: blur(6px); }
.sheet {
  position: relative; width: 100%;
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  border-bottom: none;
  padding: var(--s-6) var(--s-5) calc(var(--s-6) + env(safe-area-inset-bottom));
  box-shadow: var(--shadow-lg);
}
.drop {
  display: grid; place-items: center; width: 52px; height: 52px; margin-bottom: var(--s-4);
  border-radius: 16px; color: var(--water); background: var(--water-wash);
  box-shadow: inset 0 0 0 1px var(--water-line), var(--shadow-sm);
}
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
.no  { background: var(--surface-3); color: var(--text-dim); box-shadow: inset 0 0 0 1px var(--border); }
.yes { background: linear-gradient(165deg, var(--btn-leaf-a), var(--btn-leaf-b)); color: var(--on-leaf); box-shadow: var(--glow-leaf); }

.sheet-enter-active, .sheet-leave-active { transition: opacity var(--t-base) var(--ease-out); }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform var(--t-slow) var(--ease-spring); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
