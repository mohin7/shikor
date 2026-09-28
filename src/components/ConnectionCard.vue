<script setup>
import { ref } from 'vue'
import { settings, saveSettings } from '../composables/useGarden'

const broker = ref(settings.broker)
const base   = ref(settings.base)
const saved  = ref(false)

function apply () {
  saveSettings({ broker: broker.value.trim(), base: base.value.trim().replace(/\/+$/, '') })
  saved.value = true
  setTimeout(() => (saved.value = false), 1600)
}
</script>

<template>
  <div class="card">
    <div class="card-title">সংযোগ</div>

    <label class="f">
      <span>MQTT ব্রোকার (WebSocket)</span>
      <input v-model="broker" spellcheck="false" autocapitalize="off" autocomplete="off">
    </label>

    <label class="f">
      <span>টপিক বেস</span>
      <input v-model="base" spellcheck="false" autocapitalize="off" autocomplete="off">
    </label>

    <p class="note">
      ESP32-র কোডে <code>TOPIC_BASE</code> ঠিক এই লেখাটাই থাকতে হবে।
      পাবলিক ব্রোকারে কোনো পাসওয়ার্ড নেই — টপিকের নাম যে জানে সে-ই পাম্প চালাতে পারবে,
      তাই নামটা অনুমান করা কঠিন রাখো।
    </p>

    <button class="apply" @click="apply">{{ saved ? 'সংরক্ষিত ✓' : 'প্রয়োগ করে আবার যুক্ত হও' }}</button>
  </div>
</template>

<style scoped>
.f { display: block; margin-bottom: var(--s-4); }
.f span { display: block; font-size: 12.5px; color: var(--muted); margin-bottom: 7px; }
.f input {
  width: 100%; padding: 12px 14px; border-radius: var(--r-sm);
  background: var(--bg-elev); border: 1px solid var(--border);
  font-size: 13.5px; font-family: var(--num);
  transition: border-color var(--t-fast);
}
.f input:focus { outline: none; border-color: var(--leaf-line); }
.note { font-size: 11.5px; color: var(--faint); line-height: 1.55; margin-bottom: var(--s-4); }
.note code { color: var(--text-dim); font-family: var(--num); font-size: 11px; }
.apply {
  width: 100%; padding: 13px 0; border-radius: var(--r-md);
  background: var(--surface-3); color: var(--text);
  font-size: 14px; font-weight: 600;
}
.apply:active { transform: scale(.98); }
</style>
