<script setup>
import { computed } from 'vue'
import { device, isWatering, actions, link } from '../composables/useGarden'

const props = defineProps({ seconds: { type: Number, default: 10 } })

const ready = computed(() => link.status === 'connected' && device.online)

const label = computed(() => {
  if (isWatering.value) return 'বন্ধ করো'
  if (!ready.value)     return 'সংযোগ নেই'
  return 'পানি দাও'
})

const sub = computed(() => {
  if (isWatering.value) return device.left > 0 ? `${device.left}s বাকি` : 'চলছে'
  if (!ready.value)     return 'ডিভাইস অফলাইন'
  return `${props.seconds}s`
})

/* how much of the run is still to come, as a share of the bar */
const fill = computed(() => {
  if (!isWatering.value) return 0
  const total = Math.max(device.left || 0, props.seconds, 1)
  return Math.min(100, ((device.left || 0) / total) * 100)
})

function press () {
  if (!ready.value) return
  isWatering.value ? actions.stop() : actions.water(props.seconds)
}
</script>

<template>
  <div class="wrap">
    <button class="prime" :class="{ running: isWatering, off: !ready }"
            @click="press" :disabled="!ready">
      <span class="fill" v-if="isWatering" :style="{ width: fill + '%' }"></span>

      <span class="inner">
        <span class="ico" aria-hidden="true">
          <svg v-if="!isWatering" viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 2.7s6 6.6 6 10.6a6 6 0 1 1-12 0c0-4 6-10.6 6-10.6Z" fill="currentColor"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20">
            <rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/>
          </svg>
        </span>
        <span class="txt">{{ label }}</span>
        <span class="sub num">{{ sub }}</span>
      </span>
    </button>

    <button v-if="isWatering" class="stop" @click="actions.stop()" aria-label="জরুরি বন্ধ">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M12 3v9m6.4-6.4a9 9 0 1 1-12.8 0" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.wrap { display: flex; gap: var(--s-3); align-items: stretch; }

.prime {
  position: relative; flex: 1; height: 70px; overflow: hidden;
  border-radius: var(--r-lg);
  color: #06170E;
  background: linear-gradient(165deg, var(--leaf-bright), var(--leaf-deep));
  box-shadow: var(--glow-leaf);
  transition: transform var(--t-fast) var(--ease-spring),
              background var(--t-base), box-shadow var(--t-base);
}
.prime:active { transform: scale(.985); }
.prime.running {
  color: #05171F;
  background: linear-gradient(165deg, #7DD3FC, #0369A1);
  box-shadow: var(--glow-water);
}
.prime.off {
  color: var(--muted);
  background: linear-gradient(180deg, var(--surface-2), var(--surface));
  box-shadow: inset 0 0 0 1px var(--border);
  cursor: not-allowed;
}

/* the run's remaining time, draining left to right */
.fill {
  position: absolute; inset: 0 auto 0 0;
  background: rgba(255,255,255,.22);
  transition: width 1s linear;
}

.inner {
  position: relative;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  height: 100%;
}
.ico { display: grid; place-items: center; opacity: .92; }
.txt { font-size: 18px; font-weight: 700; letter-spacing: -.01em; }
.sub {
  font-size: 12px; font-weight: 700;
  padding: 3px 9px; border-radius: var(--r-pill);
  background: rgba(0,0,0,.16);
}

.stop {
  flex: none; width: 70px; border-radius: var(--r-lg);
  display: grid; place-items: center;
  color: var(--danger);
  background: var(--danger-wash);
  border: 1px solid var(--danger-line);
}
.stop:active { transform: scale(.95); }
</style>
