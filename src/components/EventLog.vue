<script setup>
import { log, ago, reasonLabel, clearHistory } from '../composables/useGarden'
</script>

<template>
  <div class="card">
    <div class="between" style="margin-bottom:var(--s-4)">
      <div class="card-title" style="margin:0">পানি দেওয়ার হিসাব</div>
      <button v-if="log.length" class="clear" @click="clearHistory()">মুছে ফেলো</button>
    </div>

    <div v-if="!log.length" class="empty">
      এখনো কোনো রেকর্ড নেই। একবার পানি দিলে এখানে জমা হবে।
    </div>

    <ul v-else class="list">
      <li v-for="(e, i) in log" :key="e.t + '-' + i">
        <span class="dot"></span>
        <div class="mid">
          <div class="top">
            <b class="num">{{ e.seconds }}s</b>
            <span class="why">{{ reasonLabel(e.reason) }}</span>
          </div>
          <div class="when">{{ ago(e.t) }}</div>
        </div>
        <div v-if="e.from !== null" class="delta num">
          {{ e.from }}% <span>→</span> {{ e.to }}%
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.clear { font-size: 11.5px; color: var(--muted); }
.empty { padding: 28px 0; text-align: center; font-size: 13px; color: var(--faint); line-height: 1.5; }
.list { list-style: none; margin: 0; padding: 0; }
.list li { display: flex; align-items: center; gap: var(--s-3); padding: 12px 0; }
.list li + li { border-top: 1px solid var(--hairline); }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--water); flex: none; box-shadow: 0 0 10px var(--water); }
.mid { flex: 1; min-width: 0; }
.top { display: flex; align-items: baseline; gap: 8px; }
.top b { font-size: 15px; font-weight: 700; }
.why { font-size: 12.5px; color: var(--text-dim); }
.when { font-size: 11.5px; color: var(--faint); margin-top: 1px; }
.delta { font-size: 12px; color: var(--muted); white-space: nowrap; }
.delta span { color: var(--faint); margin: 0 2px; }
</style>
