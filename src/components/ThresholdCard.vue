<script setup>
import { ref, watch, computed } from 'vue'
import { device, actions, link } from '../composables/useGarden'

const low    = ref(device.low)
const target = ref(device.target)
const max    = ref(device.max)
const dirty  = ref(false)

const ready = computed(() => link.status === 'connected' && device.online)

/* follow the device unless the user is mid-edit */
watch(() => [device.low, device.target, device.max], ([l, t, m]) => {
  if (dirty.value) return
  low.value = l; target.value = t; max.value = m
})

let timer = null
function touched () {
  dirty.value = true
  if (target.value <= low.value) target.value = Math.min(100, low.value + 5)
  clearTimeout(timer)
  timer = setTimeout(() => {
    actions.setLimits(low.value, target.value, max.value)
    dirty.value = false
  }, 700)
}
</script>

<template>
  <div class="card">
    <div class="between" style="margin-bottom:var(--s-5)">
      <div class="card-title" style="margin:0">সীমা</div>
      <span v-if="dirty" class="saving">সংরক্ষণ হচ্ছে…</span>
    </div>

    <div class="field">
      <div class="between">
        <label>শুকনো ধরা হবে</label>
        <span class="v num" style="color:var(--warn)">{{ low }}%</span>
      </div>
      <input type="range" min="10" max="70" step="1" v-model.number="low"
             :disabled="!ready" @input="touched"
             style="--thumb: var(--warn)">
      <p class="hint">এর নিচে নামলে ডিভাইস পানি দিতে চাইবে।</p>
    </div>

    <div class="field">
      <div class="between">
        <label>লক্ষ্য আর্দ্রতা</label>
        <span class="v num" style="color:var(--leaf)">{{ target }}%</span>
      </div>
      <input type="range" min="30" max="95" step="1" v-model.number="target"
             :disabled="!ready" @input="touched">
      <p class="hint">এই মাত্রায় পৌঁছালে পাম্প নিজেই থামবে।</p>
    </div>

    <div class="field last">
      <div class="between">
        <label>সর্বোচ্চ রান টাইম</label>
        <span class="v num" style="color:var(--water)">{{ max }}s</span>
      </div>
      <input type="range" min="5" max="60" step="1" v-model.number="max"
             :disabled="!ready" @input="touched"
             style="--thumb: var(--water)">
      <p class="hint">একবারে এর বেশি সময় পাম্প চলবে না — নিরাপত্তা সীমা।</p>
    </div>
  </div>
</template>

<style scoped>
.field { margin-bottom: var(--s-5); }
.field.last { margin-bottom: 0; }
label { font-size: 14px; font-weight: 600; color: var(--text-dim); }
.v { font-size: 15px; font-weight: 700; }
.hint { font-size: 11.5px; color: var(--faint); line-height: 1.4; margin-top: 2px; }
.saving { font-size: 11px; color: var(--leaf); }
</style>
