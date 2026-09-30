<script setup>
import Icon from './Icon.vue'
defineProps({
  title: String, desc: String, on: Boolean, icon: String,
  tone: { type: String, default: 'leaf' }, disabled: Boolean
})
defineEmits(['toggle'])
</script>

<template>
  <button class="tr" :class="{ on, disabled }" role="switch" :aria-checked="on"
          :style="{ '--tone': `var(--${tone})`, '--tone-wash': `var(--${tone}-wash)`, '--tone-line': `var(--${tone}-line)` }"
          @click="!disabled && $emit('toggle')" :disabled="disabled">
    <span v-if="icon" class="lead"><Icon :name="icon" :size="18" /></span>
    <span class="txt">
      <span class="t">{{ title }}</span>
      <span class="d">{{ desc }}</span>
    </span>
    <span class="sw" :class="{ on }"><i></i></span>
  </button>
</template>

<style scoped>
.tr {
  width: 100%; display: flex; align-items: center;
  gap: var(--s-3); padding: var(--s-4) 0; text-align: left;
}
.tr + .tr { border-top: 1px solid var(--hairline); }
.tr.disabled { opacity: .5; cursor: not-allowed; }

.lead {
  display: grid; place-items: center; flex: none; width: 38px; height: 38px;
  border-radius: 12px; color: var(--muted); background: var(--surface-3);
  box-shadow: inset 0 0 0 1px var(--border);
  transition: all var(--t-base) var(--ease-out);
}
.tr.on .lead { color: var(--tone); background: var(--tone-wash); box-shadow: inset 0 0 0 1px var(--tone-line); }

.txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.t { font-size: 15px; font-weight: 600; }
.d { font-size: 12.5px; color: var(--muted); line-height: 1.4; }

.sw {
  flex: none; width: 50px; height: 30px; border-radius: var(--r-pill);
  background: var(--surface-3); border: 1px solid var(--border-strong);
  padding: 3px; transition: background var(--t-base) var(--ease-out), border-color var(--t-base);
  box-shadow: inset 0 1px 2px rgba(20, 50, 30, .12);
}
.sw i {
  display: block; width: 22px; height: 22px; border-radius: 50%;
  background: var(--knob); box-shadow: var(--knob-shadow);
  transition: transform var(--t-base) var(--ease-spring);
}
.sw.on { background: var(--tone); border-color: var(--tone); }
.sw.on i { transform: translateX(20px); }
</style>
