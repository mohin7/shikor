<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  connect, device, link, isWatering, isDry, isWaiting,
  actions, isSnoozed, quietLabel
} from './composables/useGarden'

import StatusBar       from './components/StatusBar.vue'
import MoistureGauge   from './components/MoistureGauge.vue'
import PrimaryAction   from './components/PrimaryAction.vue'
import DurationPicker  from './components/DurationPicker.vue'
import ModeCard        from './components/ModeCard.vue'
import ThresholdCard   from './components/ThresholdCard.vue'
import HistoryChart    from './components/HistoryChart.vue'
import EventLog        from './components/EventLog.vue'
import DeviceCard      from './components/DeviceCard.vue'
import ConnectionCard  from './components/ConnectionCard.vue'
import PermissionSheet from './components/PermissionSheet.vue'
import TabBar          from './components/TabBar.vue'

const tab = ref('home')
const seconds = ref(10)

onMounted(connect)

const banner = computed(() => {
  if (link.status === 'error')
    return { k: 'bad', t: 'ব্রোকারে যুক্ত হওয়া যাচ্ছে না — ইন্টারনেট দেখো।' }
  if (link.status === 'connected' && device.seen && !device.online)
    return { k: 'bad', t: 'ডিভাইস সাড়া দিচ্ছে না — ESP32-তে পাওয়ার আছে তো?' }
  if (isDry.value && !isWatering.value)
    return { k: 'warn', t: `মাটি শুকনো — ${device.soil}%, সীমা ${device.low}%` }
  return null
})

/* a parked request: quiet, but one tap away */
const parked = computed(() =>
  isWaiting.value && isSnoozed.value && !isWatering.value)
</script>

<template>
  <div class="app">
    <StatusBar />

    <main :class="tab">
      <!-- ================= HOME ================= -->
      <section v-show="tab === 'home'" class="stack">
        <Transition name="fade">
          <div v-if="banner" class="banner" :class="banner.k">{{ banner.t }}</div>
        </Transition>

        <Transition name="fade">
          <button v-if="parked" class="parked" @click="actions.unsnooze()">
            <span class="pt">অনুরোধ পরে দেখতে বলেছ</span>
            <span class="pd">{{ quietLabel }} চুপ থাকবে · দেখতে চাপো</span>
          </button>
        </Transition>

        <div class="hero">
          <MoistureGauge />
        </div>

        <div class="act">
          <PrimaryAction :seconds="seconds" />
        </div>

        <DurationPicker v-model="seconds" />
        <ModeCard />
        <ThresholdCard />
      </section>

      <!-- ================= HISTORY ================= -->
      <section v-show="tab === 'history'" class="stack">
        <HistoryChart />
        <EventLog />
      </section>

      <!-- ================= SETTINGS ================= -->
      <section v-show="tab === 'settings'" class="stack">
        <DeviceCard />
        <ConnectionCard />
        <div class="card about">
          <div class="card-title">Shikor</div>
          <p>
            ব্যালকনি বাগানের জন্য স্বয়ংক্রিয় সেচ। মাটির আর্দ্রতা মেপে ESP32 সিদ্ধান্ত নেয়,
            আর তুমি যেখানেই থাকো — অনুমতি দাও বা নিজে পানি দাও।
          </p>
          <p class="small">
            ফোনে অ্যাপের মতো রাখতে: ব্রাউজারের শেয়ার মেনু →
            <b>Add to Home Screen</b>।
          </p>
          <p class="small dim">v1.0 · Mohin Uddin</p>
        </div>
      </section>
    </main>

    <PermissionSheet />
    <TabBar v-model="tab" />
  </div>
</template>

<style scoped>
.app { position: relative; z-index: 1; min-height: 100%; }

main {
  max-width: 460px; margin: 0 auto;
  padding: 0 var(--s-5) calc(112px + env(safe-area-inset-bottom));
}

.hero { padding: 0; margin-bottom: -24px; }

.act { margin-top: var(--s-2); }

.banner {
  padding: 12px 15px; border-radius: var(--r-md);
  font-size: 13px; font-weight: 600; line-height: 1.45;
}
.banner.warn { color: var(--warn);   background: var(--warn-wash);   border: 1px solid var(--warn-line); }
.banner.bad  { color: var(--danger); background: var(--danger-wash); border: 1px solid var(--danger-line); }

.parked {
  width: 100%; text-align: left;
  display: flex; flex-direction: column; gap: 3px;
  padding: 12px 15px; border-radius: var(--r-md);
  background: var(--surface-2); border: 1px solid var(--border);
}
.parked:active { transform: scale(.99); }
.pt { font-size: 13.5px; font-weight: 600; color: var(--text-dim); }
.pd { font-size: 11.5px; color: var(--faint); }

.about p { font-size: 13.5px; color: var(--text-dim); line-height: 1.6; }
.about p + p { margin-top: var(--s-3); }
.about .small { font-size: 12px; color: var(--muted); }
.about .dim { color: var(--faint); }
.about b { color: var(--text); }

.fade-enter-active, .fade-leave-active { transition: all var(--t-base) var(--ease-out); }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
