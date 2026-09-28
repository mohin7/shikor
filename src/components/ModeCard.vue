<script setup>
import { computed } from 'vue'
import { device, actions, link, isWatering } from '../composables/useGarden'
import ToggleRow from './ToggleRow.vue'

const ready = computed(() => link.status === 'connected' && device.online)
</script>

<template>
  <div class="card">
    <div class="card-title">মোড</div>

    <ToggleRow
      title="স্বয়ংক্রিয় (ছুটির মোড)"
      :desc="device.auto
        ? 'মাটি শুকালে নিজেই পানি দেবে, অনুমতি চাইবে না।'
        : 'মাটি শুকালে আগে তোমার অনুমতি চাইবে।'"
      :on="device.auto"
      :disabled="!ready"
      @toggle="device.auto ? actions.autoOff() : actions.autoOn()" />

    <ToggleRow
      title="ম্যানুয়াল পাম্প"
      desc="টাইমার ছাড়া চালু থাকবে — নিজে বন্ধ না করা পর্যন্ত।"
      tone="water"
      :on="device.manual"
      :disabled="!ready"
      @toggle="device.manual ? actions.manualOff() : actions.manualOn()" />

    <p v-if="device.manual" class="warn">
      ⚠ ম্যানুয়াল মোডে নিরাপত্তা টাইমার নেই। কাজ শেষে নিজে বন্ধ করো।
    </p>
  </div>
</template>

<style scoped>
.warn {
  margin-top: var(--s-3); padding: 10px 12px;
  font-size: 12.5px; line-height: 1.4; color: var(--warn);
  background: var(--warn-wash); border: 1px solid var(--warn-line);
  border-radius: var(--r-sm);
}
</style>
