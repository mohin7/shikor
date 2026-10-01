<script setup>
import { watch, onUnmounted } from 'vue'
import { guideOpen, closeGuide } from '../composables/useGuide'
import { t } from '../composables/useI18n'
import Icon from './Icon.vue'

const steps = [
  { id: 's1', icon: 'power' },
  { id: 's2', icon: 'wifi', subs: ['1', '2', '3', '4'], note: true },
  { id: 's3', icon: 'link' },
  { id: 's4', icon: 'drop' },
  { id: 's5', icon: 'auto' },
  { id: 's6', icon: 'phone' }
]

/* lock page scroll behind the sheet; close on Esc */
const onKey = (e) => { if (e.key === 'Escape') closeGuide() }
watch(guideOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
  open ? addEventListener('keydown', onKey) : removeEventListener('keydown', onKey)
})
onUnmounted(() => { document.documentElement.style.overflow = ''; removeEventListener('keydown', onKey) })
</script>

<template>
  <Transition name="sheet">
    <div v-if="guideOpen" class="wrap" role="dialog" aria-modal="true" :aria-label="t('guide.title')">
      <div class="scrim" @click="closeGuide"></div>
      <div class="sheet card">
        <header>
          <div class="hd">
            <span class="hdic"><Icon name="book" :size="19" /></span>
            <div>
              <h2>{{ t('guide.title') }}</h2>
              <p>{{ t('guide.sub') }}</p>
            </div>
          </div>
          <button class="x" @click="closeGuide" :aria-label="t('guide.close')"><Icon name="close" :size="18" /></button>
        </header>

        <div class="scroll">
          <ol class="steps">
            <li v-for="(s, i) in steps" :key="s.id">
              <span class="n num">{{ i + 1 }}</span>
              <div class="c">
                <h3><Icon :name="s.icon" :size="15" />{{ t(`guide.${s.id}.t`) }}</h3>
                <p>{{ t(`guide.${s.id}.b`) }}</p>
                <ol v-if="s.subs" class="subs">
                  <li v-for="k in s.subs" :key="k"><b class="num">{{ k }}</b><span>{{ t(`guide.${s.id}.${k}`) }}</span></li>
                </ol>
                <p v-if="s.note" class="note">{{ t(`guide.${s.id}.note`) }}</p>
              </div>
            </li>
          </ol>

          <div class="leds">
            <h3>{{ t('guide.led.t') }}</h3>
            <p><i class="dot g"></i>{{ t('guide.led.g') }}</p>
            <p><i class="dot r"></i>{{ t('guide.led.r') }}</p>
            <p><i class="dot r blink"></i>{{ t('guide.led.rb') }}</p>
            <p><i class="dot both"></i>{{ t('guide.led.both') }}</p>
          </div>
        </div>

        <footer><button class="done" @click="closeGuide">{{ t('guide.done') }}</button></footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.wrap { position: fixed; inset: 0; z-index: 70; display: flex; align-items: flex-end; justify-content: center; }
.scrim { position: absolute; inset: 0; background: var(--scrim); backdrop-filter: blur(6px); }
.sheet {
  position: relative; width: 100%; max-width: 520px; max-height: 92dvh;
  display: flex; flex-direction: column;
  border-radius: var(--r-xl) var(--r-xl) 0 0; border-bottom: none;
  padding: 0; box-shadow: var(--shadow-lg);
}
header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-3); padding: var(--s-5) var(--s-5) var(--s-3); }
.hd { display: flex; gap: var(--s-3); align-items: flex-start; }
.hdic {
  display: grid; place-items: center; width: 38px; height: 38px; flex: none; border-radius: 12px;
  color: var(--leaf); background: var(--leaf-wash); box-shadow: inset 0 0 0 1px var(--leaf-line), var(--shadow-sm);
}
h2 { font-size: 19px; font-weight: 700; letter-spacing: -.02em; line-height: 1.25; }
header p { font-size: 13px; color: var(--muted); margin-top: 2px; line-height: 1.4; }
.x {
  width: 32px; height: 32px; flex: none; border-radius: 50%; display: grid; place-items: center;
  background: var(--surface-3); color: var(--text-dim); box-shadow: inset 0 0 0 1px var(--border);
}
.x:active { transform: scale(.92); }

.scroll { overflow-y: auto; overscroll-behavior: contain; padding: var(--s-2) var(--s-5) var(--s-4); }
.steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--s-5); position: relative; }
.steps > li { display: flex; gap: var(--s-3); position: relative; }
.steps > li:not(:last-child)::before {
  content: ''; position: absolute; left: 13px; top: 30px; bottom: calc(-1 * var(--s-5) + 4px);
  width: 2px; background: var(--hairline); border-radius: 2px;
}
.n {
  display: grid; place-items: center; width: 28px; height: 28px; flex: none; border-radius: 50%;
  font-size: 13px; font-weight: 700; color: var(--on-leaf);
  background: linear-gradient(165deg, var(--btn-leaf-a), var(--btn-leaf-b));
}
.c { min-width: 0; padding-top: 3px; }
.c h3 { display: flex; align-items: center; gap: 7px; font-size: 15px; font-weight: 700; color: var(--text); }
.c h3 svg { color: var(--leaf); }
.c p { font-size: 13.5px; color: var(--text-dim); line-height: 1.6; margin-top: 5px; }
.subs { list-style: none; margin: var(--s-3) 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.subs li {
  display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px;
  background: var(--bg-elev); border: 1px solid var(--hairline); border-radius: var(--r-sm);
  font-size: 13px; line-height: 1.5; color: var(--text-dim);
}
.subs b { color: var(--water); font-size: 12px; min-width: 14px; }
.c .note {
  margin-top: var(--s-3); padding: 10px 12px; border-radius: var(--r-sm); font-size: 12.5px;
  color: var(--warn); background: var(--warn-wash); border: 1px solid var(--warn-line);
}

.leds { margin-top: var(--s-6); padding: var(--s-4); background: var(--bg-elev); border: 1px solid var(--hairline); border-radius: var(--r-md); }
.leds h3 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.leds p { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-dim); line-height: 1.5; padding: 3px 0; }
.dot { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.dot.g { background: var(--leaf); box-shadow: 0 0 8px var(--leaf); }
.dot.r { background: var(--danger); box-shadow: 0 0 8px var(--danger); }
.dot.blink { animation: bl 1s steps(2, jump-none) infinite; }
.dot.both { background: linear-gradient(90deg, var(--leaf) 50%, var(--danger) 50%); animation: bl 1s steps(2, jump-none) infinite; }
@keyframes bl { 50% { opacity: .2; } }

footer { padding: var(--s-3) var(--s-5) calc(var(--s-4) + env(safe-area-inset-bottom)); border-top: 1px solid var(--hairline); }
.done {
  width: 100%; padding: 15px 0; border-radius: var(--r-md); font-size: 15px; font-weight: 700;
  background: linear-gradient(165deg, var(--btn-leaf-a), var(--btn-leaf-b)); color: var(--on-leaf); box-shadow: var(--glow-leaf);
}
.done:active { transform: scale(.98); }

.sheet-enter-active, .sheet-leave-active { transition: opacity var(--t-base) var(--ease-out); }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform var(--t-slow) var(--ease-spring); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
@media (prefers-reduced-motion: reduce) { .dot.blink, .dot.both { animation: none; } }
</style>
