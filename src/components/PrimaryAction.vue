<script setup>
import { computed } from 'vue'
import { device, isWatering, actions, link, runLeft, runShare } from '../composables/useGarden'
import { t } from '../composables/useI18n'
import Icon from './Icon.vue'

const emit = defineEmits(['help'])
const props = defineProps({ seconds: { type: Number, default: 10 } })

const ready = computed(() => link.status === 'connected' && device.online)

/* the device caps every run at its own "max"; show (and send) what will really run */
const effective = computed(() =>
  device.seen && device.max > 0 ? Math.min(props.seconds, device.max) : props.seconds)

const label = computed(() => isWatering.value ? t('action.stop') : t('action.water'))

const sub = computed(() => {
  if (isWatering.value) return runLeft.value > 0 ? t('action.left', { n: Math.ceil(runLeft.value) }) : t('action.running')
  if (!ready.value)     return link.status === 'connected' ? t('action.deviceOffline') : t('action.notConnected')
  return `${effective.value}s`
})

/* how much of the run is still to come, as a share of the bar */
const fill = computed(() => {
  if (!isWatering.value) return 0
  return device.manual ? 100 : runShare.value * 100
})

function press () {
  if (!ready.value) return
  isWatering.value ? actions.stop() : actions.water(effective.value)
}
</script>

<template>
  <div class="outer">
  <div class="wrap">
    <button class="prime" :class="{ running: isWatering, off: !ready }"
            @click="press" :disabled="!ready">
      <span class="fill" v-if="isWatering" :style="{ width: fill + '%' }"></span>

      <span class="inner">
        <span class="ico" aria-hidden="true">
          <Icon :name="isWatering ? 'stop' : 'drop'" :size="22" fill />
        </span>
        <span class="txt">{{ label }}</span>
        <span class="sub num">{{ sub }}</span>
      </span>
    </button>

    <button v-if="isWatering" class="stop" @click="actions.stop()" :aria-label="t('action.emergency')">
      <Icon name="power" :size="22" :stroke="2" />
    </button>
  </div>

  <div v-if="!ready && !isWatering" class="why" role="status">
    <Icon name="info" :size="17" />
    <div class="wt">
      <b>{{ t('action.hint.title') }}</b>
      <span>{{ link.status === 'connected' ? t('action.hint.body') : t('action.hint.broker') }}</span>
      <button class="go" @click="emit('help')">{{ t('action.hint.open') }}</button>
    </div>
  </div>
  </div>
</template>

<style scoped>
.outer { display: flex; flex-direction: column; gap: var(--s-3); }
.why {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 14px; border-radius: var(--r-md);
  color: var(--text-dim); background: var(--surface-2); border: 1px solid var(--border);
  font-size: 12.5px; line-height: 1.5; box-shadow: var(--shadow-sm);
}
.why svg { margin-top: 1px; color: var(--warn); }
.wt { display: flex; flex-direction: column; gap: 2px; align-items: flex-start; }
.wt b { color: var(--text); font-size: 13px; }
.go { margin-top: 6px; padding: 6px 12px; border-radius: var(--r-pill); font-size: 12px; font-weight: 700; color: var(--leaf); background: var(--leaf-wash); box-shadow: inset 0 0 0 1px var(--leaf-line); }
.wrap { display: flex; gap: var(--s-3); align-items: stretch; }

.prime {
  position: relative; flex: 1; height: 68px; overflow: hidden;
  border-radius: var(--r-lg);
  color: var(--on-leaf);
  background: linear-gradient(165deg, var(--btn-leaf-a), var(--btn-leaf-b));
  box-shadow: var(--glow-leaf);
  transition: transform var(--t-fast) var(--ease-spring),
              background var(--t-base), box-shadow var(--t-base);
}
.prime:active { transform: scale(.985); }
.prime.running {
  color: var(--on-water);
  background: linear-gradient(165deg, var(--btn-water-a), var(--btn-water-b));
  box-shadow: var(--glow-water);
}
.prime.off {
  color: var(--muted);
  background: linear-gradient(180deg, var(--surface-2), var(--surface));
  box-shadow: inset 0 0 0 1px var(--border), var(--shadow-sm);
  cursor: not-allowed;
}

/* the run's remaining time, draining left to right */
.fill {
  position: absolute; inset: 0 auto 0 0;
  background: rgba(255,255,255,.22);
  transition: width .12s linear;
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
  flex: none; width: 68px; border-radius: var(--r-lg);
  display: grid; place-items: center;
  color: var(--danger);
  background: var(--danger-wash);
  border: 1px solid var(--danger-line);
  box-shadow: var(--shadow-sm);
}
.stop:active { transform: scale(.95); }
</style>
