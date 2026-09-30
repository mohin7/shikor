<script setup>
import { ref, watch, computed } from 'vue'
import { device } from '../composables/useGarden'
import { t } from '../composables/useI18n'
import Icon from './Icon.vue'

const model = defineModel({ type: Number, default: 10 })
const presets = [5, 10, 20, 30]
const custom = ref(!presets.includes(model.value))

watch(model, (v) => { if (presets.includes(v)) custom.value = false })

function pick (v) { custom.value = false; model.value = v }

/* the device stops every run at its own "max" limit */
const capped = computed(() => device.seen && model.value > device.max)
</script>

<template>
  <div class="card">
    <div class="between" style="margin-bottom:var(--s-4)">
      <div class="card-title" style="margin:0"><span class="ti"><Icon name="timer" :size="15" /></span>{{ t('dur.title') }}</div>
      <div class="pill num">{{ model }}<small>s</small></div>
    </div>

    <div class="chips">
      <button v-for="p in presets" :key="p"
              class="chip" :class="{ on: !custom && model === p }"
              @click="pick(p)">{{ p }}s</button>
      <button class="chip" :class="{ on: custom }" @click="custom = true">{{ t('dur.custom') }}</button>
    </div>

    <div v-if="custom" class="slider">
      <input type="range" min="1" max="60" step="1" v-model.number="model"
             :style="{ '--p': ((model - 1) / 59 * 100) + '%' }">
      <div class="ends num"><span>1s</span><span>60s</span></div>
    </div>

    <p class="sum">{{ t('dur.summary', { n: capped ? device.max : model }) }}</p>

    <p v-if="capped" class="cap">{{ t('dur.capped', { max: device.max }) }}</p>
  </div>
</template>

<style scoped>
.pill {
  font-size: 20px; font-weight: 700; color: var(--leaf); line-height: 1;
  padding: 4px 2px;
}
.pill small { font-size: 12px; font-weight: 600; margin-left: 1px; color: var(--muted); }
.sum { margin-top: var(--s-3); font-size: 12.5px; color: var(--muted); }
.chips { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--s-2); }
.chip {
  padding: 11px 0; border-radius: var(--r-sm);
  background: var(--surface-3); border: 1px solid var(--hairline);
  color: var(--text-dim); font-size: 13.5px; font-weight: 600;
  transition: all var(--t-fast) var(--ease-out);
}
.chip:active { transform: scale(.94); }
.chip.on {
  background: linear-gradient(165deg, var(--btn-leaf-a), var(--btn-leaf-b));
  border-color: transparent; color: var(--on-leaf);
  box-shadow: var(--glow-leaf);
}
.slider { margin-top: var(--s-4); }
.cap {
  margin-top: var(--s-3); padding: 9px 12px; border-radius: var(--r-sm);
  font-size: 12px; line-height: 1.45; color: var(--warn);
  background: var(--warn-wash); border: 1px solid var(--warn-line);
}
.ends { display: flex; justify-content: space-between; font-size: 11px; color: var(--faint); }
</style>
