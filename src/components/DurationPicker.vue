<script setup>
import { ref, watch } from 'vue'

const model = defineModel({ type: Number, default: 10 })
const presets = [5, 10, 20, 30]
const custom = ref(!presets.includes(model.value))

watch(model, (v) => { if (presets.includes(v)) custom.value = false })

function pick (v) { custom.value = false; model.value = v }
</script>

<template>
  <div class="card">
    <div class="between" style="margin-bottom:var(--s-4)">
      <div class="card-title" style="margin:0">কতক্ষণ</div>
      <div class="pill num">{{ model }}s</div>
    </div>

    <div class="chips">
      <button v-for="p in presets" :key="p"
              class="chip" :class="{ on: !custom && model === p }"
              @click="pick(p)">{{ p }}s</button>
      <button class="chip" :class="{ on: custom }" @click="custom = true">নিজে</button>
    </div>

    <div v-if="custom" class="slider">
      <input type="range" min="1" max="60" step="1" v-model.number="model">
      <div class="ends num"><span>1s</span><span>60s</span></div>
    </div>
  </div>
</template>

<style scoped>
.pill {
  font-size: 13px; font-weight: 700; color: var(--leaf);
  background: var(--leaf-wash); border: 1px solid var(--leaf-line);
  padding: 3px 10px; border-radius: var(--r-pill);
}
.chips { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--s-2); }
.chip {
  padding: 11px 0; border-radius: var(--r-sm);
  background: var(--surface-3); border: 1px solid transparent;
  color: var(--text-dim); font-size: 13.5px; font-weight: 600;
  transition: all var(--t-fast) var(--ease-out);
}
.chip:active { transform: scale(.94); }
.chip.on {
  background: var(--leaf-wash); border-color: var(--leaf-line);
  color: var(--leaf); box-shadow: 0 0 20px -6px rgba(74,222,128,.5);
}
.slider { margin-top: var(--s-4); }
.ends { display: flex; justify-content: space-between; font-size: 11px; color: var(--faint); }
</style>
