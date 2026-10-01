<script setup>
import { computed } from 'vue'
import { installHelp, isIOS } from '../composables/useInstall'
import { t } from '../composables/useI18n'
import Icon from './Icon.vue'

const close = () => (installHelp.value = false)
/* the platform we detected goes first */
const groups = computed(() => {
  const ios = { id: 'ios', h: t('install.ios.h') }, and = { id: 'and', h: t('install.and.h') }
  return isIOS ? [ios, and] : [and, ios]
})
</script>

<template>
  <Transition name="sheet">
    <div v-if="installHelp" class="wrap" role="dialog" aria-modal="true" :aria-label="t('install.title')">
      <div class="scrim" @click="close"></div>
      <div class="sheet card">
        <div class="top">
          <span class="hdic"><Icon name="phone" :size="20" /></span>
          <button class="x" @click="close" :aria-label="t('guide.close')"><Icon name="close" :size="18" /></button>
        </div>
        <h2>{{ t('install.title') }}</h2>
        <p class="sub">{{ t('install.sub') }}</p>

        <section v-for="g in groups" :key="g.id">
          <h3>{{ g.h }}</h3>
          <ol>
            <li v-for="n in 3" :key="n"><b class="num">{{ n }}</b><span>{{ t(`install.${g.id}.${n}`) }}</span></li>
          </ol>
        </section>

        <button class="done" @click="close">{{ t('guide.done') }}</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.wrap { position: fixed; inset: 0; z-index: 80; display: flex; align-items: flex-end; justify-content: center; }
.scrim { position: absolute; inset: 0; background: var(--scrim); backdrop-filter: blur(6px); }
.sheet {
  position: relative; width: 100%; max-width: 520px; max-height: 92dvh; overflow-y: auto;
  border-radius: var(--r-xl) var(--r-xl) 0 0; border-bottom: none;
  padding: var(--s-5) var(--s-5) calc(var(--s-5) + env(safe-area-inset-bottom)); box-shadow: var(--shadow-lg);
}
.top { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--s-3); }
.hdic { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; color: var(--leaf); background: var(--leaf-wash); box-shadow: inset 0 0 0 1px var(--leaf-line), var(--shadow-sm); }
.x { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: var(--surface-3); color: var(--text-dim); box-shadow: inset 0 0 0 1px var(--border); }
h2 { font-size: 20px; font-weight: 700; letter-spacing: -.02em; }
.sub { font-size: 13.5px; color: var(--muted); margin-top: 4px; line-height: 1.5; }
section { margin-top: var(--s-5); }
h3 { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
li { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; background: var(--bg-elev); border: 1px solid var(--hairline); border-radius: var(--r-sm); font-size: 13px; line-height: 1.5; color: var(--text-dim); }
li b { color: var(--water); font-size: 12px; min-width: 14px; }
.done { width: 100%; margin-top: var(--s-5); padding: 15px 0; border-radius: var(--r-md); font-size: 15px; font-weight: 700; background: linear-gradient(165deg, var(--btn-leaf-a), var(--btn-leaf-b)); color: var(--on-leaf); box-shadow: var(--glow-leaf); }
.done:active { transform: scale(.98); }
.sheet-enter-active, .sheet-leave-active { transition: opacity var(--t-base) var(--ease-out); }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform var(--t-slow) var(--ease-spring); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
