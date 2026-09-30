<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  connect, device, link, isWatering, isWaiting,
  actions, isSnoozed, quietLabel
} from './composables/useGarden'
import { t } from './composables/useI18n'

import StatusBar       from './components/StatusBar.vue'
import WaterScene      from './components/WaterScene.vue'
import PrimaryAction   from './components/PrimaryAction.vue'
import DurationPicker  from './components/DurationPicker.vue'
import ModeCard        from './components/ModeCard.vue'
import ThresholdCard   from './components/ThresholdCard.vue'
import HistoryChart    from './components/HistoryChart.vue'
import EventLog        from './components/EventLog.vue'
import DeviceCard      from './components/DeviceCard.vue'
import ConnectionCard  from './components/ConnectionCard.vue'
import AppearanceCard  from './components/AppearanceCard.vue'
import PermissionSheet from './components/PermissionSheet.vue'
import TabBar          from './components/TabBar.vue'
import Icon            from './components/Icon.vue'

const tab = ref('home')
const seconds = ref(10)

onMounted(connect)

const banner = computed(() => {
  /* only what the picture above can't already say: a broken sensor.
     "dry" is the scene itself; "offline" is the status pill + the hint under the button. */
  if (device.seen && device.online && device.fault)
    return { k: 'bad', t: t('banner.fault') }
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
          <div v-if="banner" class="banner" :class="banner.k" role="status">
            <Icon :name="banner.k === 'warn' ? 'drop' : 'alert'" :size="17" />
            <span>{{ banner.t }}</span>
          </div>
        </Transition>

        <Transition name="fade">
          <button v-if="parked" class="parked" @click="actions.unsnooze()">
            <span class="pt">{{ t('parked.title') }}</span>
            <span class="pd">{{ t('parked.sub', { time: quietLabel }) }}</span>
          </button>
        </Transition>

        <WaterScene />

        <PrimaryAction :seconds="seconds" @help="tab = 'settings'" />

        <DurationPicker v-model="seconds" />
        <ModeCard />
      </section>

      <!-- ================= HISTORY ================= -->
      <section v-show="tab === 'history'" class="stack">
        <HistoryChart />
        <EventLog />
      </section>

      <!-- ================= SETTINGS ================= -->
      <section v-show="tab === 'settings'" class="stack">
        <AppearanceCard />
        <ThresholdCard />
        <DeviceCard />
        <ConnectionCard />
        <div class="card about">
          <div class="card-title"><span class="ti"><Icon name="sprout" :size="15" :stroke="2" /></span>Shikor</div>
          <p>{{ t('about.body') }}</p>
          <p class="small">
            {{ t('about.install') }}
            <b>Add to Home Screen</b>
          </p>
          <p class="small dim">{{ t('about.version') }}</p>
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

.banner {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 14px; border-radius: var(--r-md);
  font-size: 13px; font-weight: 600; line-height: 1.45;
  box-shadow: var(--shadow-sm);
}
.banner svg { margin-top: 1px; }
.banner.warn { color: var(--warn);   background: var(--warn-wash);   border: 1px solid var(--warn-line); }
.banner.bad  { color: var(--danger); background: var(--danger-wash); border: 1px solid var(--danger-line); }

.parked {
  width: 100%; text-align: left;
  display: flex; flex-direction: column; gap: 3px;
  padding: 12px 15px; border-radius: var(--r-md);
  background: var(--surface-2); border: 1px solid var(--border); box-shadow: var(--shadow-sm);
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
