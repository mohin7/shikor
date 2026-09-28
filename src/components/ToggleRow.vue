<script setup>
defineProps({
  title: String, desc: String, on: Boolean,
  tone: { type: String, default: 'leaf' }, disabled: Boolean
})
defineEmits(['toggle'])
</script>

<template>
  <button class="tr" :class="{ on, disabled }" :style="{ '--tone': `var(--${tone})`, '--tone-line': `var(--${tone}-line)` }"
          @click="!disabled && $emit('toggle')" :disabled="disabled">
    <span class="txt">
      <span class="t">{{ title }}</span>
      <span class="d">{{ desc }}</span>
    </span>
    <span class="sw" :class="{ on }"><i></i></span>
  </button>
</template>

<style scoped>
.tr {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  gap: var(--s-4); padding: var(--s-4) 0; text-align: left;
}
.tr + .tr { border-top: 1px solid var(--hairline); }
.tr.disabled { opacity: .45; cursor: not-allowed; }
.txt { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.t { font-size: 15px; font-weight: 600; }
.d { font-size: 12.5px; color: var(--muted); line-height: 1.35; }

.sw {
  flex: none; width: 50px; height: 30px; border-radius: var(--r-pill);
  background: var(--surface-3); border: 1px solid var(--border);
  padding: 3px; transition: all var(--t-base) var(--ease-out);
}
.sw i {
  display: block; width: 22px; height: 22px; border-radius: 50%;
  background: var(--muted);
  transition: transform var(--t-base) var(--ease-spring), background var(--t-base);
}
.sw.on { background: var(--tone); border-color: var(--tone); }
.sw.on i { transform: translateX(20px); background: #06170E; }
</style>
