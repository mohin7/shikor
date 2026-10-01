<script setup>
/* One icon family for the whole app: 24×24 grid, round caps and joins,
   one stroke weight. Add a new icon by adding an entry to `paths`.
   Usage:  <Icon name="drop" :size="18" />   (inherits currentColor)        */
import { computed } from 'vue'

const props = defineProps({
  name:   { type: String, required: true },
  size:   { type: Number, default: 20 },
  stroke: { type: Number, default: 1.8 },
  fill:   { type: Boolean, default: false }     // solid version (drop, stop)
})

const paths = {
  home:     ['M3 10.6 12 3l9 7.6', 'M5 9.4V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.4', 'M10 21v-6h4v6'],
  history:  ['M3 12a9 9 0 1 0 2.64-6.36L3 8.3', 'M3 3.5v4.8h4.8', 'M12 7.5V12l3 1.8'],
  settings: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'],
  drop:     ['M12 2.9s6.2 6.4 6.2 10.6a6.2 6.2 0 0 1-12.4 0C5.8 9.3 12 2.9 12 2.9z'],
  stop:     ['M8.5 5.5h7a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3z'],
  power:    ['M12 3v8.2', 'M6.6 6.7a8 8 0 1 0 10.8 0'],
  sun:      ['M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z', 'M12 2.6v1.8M12 19.6v1.8M4.9 4.9l1.3 1.3M17.8 17.8l1.3 1.3M2.6 12h1.8M19.6 12h1.8M4.9 19.1l1.3-1.3M17.8 6.2l1.3-1.3'],
  moon:     ['M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6a8.6 8.6 0 1 0 10.7 10.7z'],
  sprout:   ['M12 21v-9.5', 'M12 12.5C12 8.2 15 5 20.5 5c0 5-3.4 7.5-8.5 7.5z', 'M12 15.5C12 12.6 9.6 10 5.5 10c0 3.8 2.4 5.5 6.5 5.5z'],
  auto:     ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
  sliders:  ['M4 7h8M16 7h4M4 17h3M11 17h9', 'M16 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0z', 'M11 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z'],
  timer:    ['M9.5 2.5h5', 'M12 14l2.8-2.8', 'M20 14a8 8 0 1 1-16 0 8 8 0 0 1 16 0z'],
  chart:    ['M3.5 3.5V19a1.5 1.5 0 0 0 1.5 1.5h15.5', 'M7.5 15l3.6-4.2 3 2.6 4.9-6'],
  list:     ['M9 6h11.5M9 12h11.5M9 18h11.5', 'M4.2 6h.01M4.2 12h.01M4.2 18h.01'],
  chip:     ['M7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9A2.5 2.5 0 0 1 7.5 5z', 'M9.5 9.5h5v5h-5z', 'M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3'],
  link:     ['M10 13.2a4.6 4.6 0 0 0 6.9.5l2.8-2.8a4.6 4.6 0 0 0-6.5-6.5l-1.6 1.6', 'M14 10.8a4.6 4.6 0 0 0-6.9-.5l-2.8 2.8a4.6 4.6 0 0 0 6.5 6.5l1.6-1.6'],
  globe:    ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', 'M3.5 9h17M3.5 15h17', 'M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z'],
  contrast: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', 'M12 3v18'],
  info:     ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', 'M12 11v5.2', 'M12 7.8h.01'],
  alert:    ['M10.3 4.1 2.4 17.7A2 2 0 0 0 4.1 20.7h15.8a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0z', 'M12 9.6v4', 'M12 17.2h.01'],
  check:    ['M20 6.5 9.6 17 4.5 12'],
  wifi:     ['M4.6 10.2a10.5 10.5 0 0 1 14.8 0', 'M7.8 13.4a6 6 0 0 1 8.4 0', 'M10.8 16.5a1.7 1.7 0 0 1 2.4 0'],
  activity: ['M21.5 12h-4l-3 8.5L9.5 3.5 6.5 12h-4'],
  pause:    ['M9 5.5v13M15 5.5v13'],
  refresh:  ['M21 12a9 9 0 1 1-3-6.7L21 8', 'M21 3v5h-5'],
  clock:    ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', 'M12 7v5l3 2'],
  help:     ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', 'M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7', 'M12 17.2h.01'],
  download: ['M12 3v12', 'M7.5 10.5 12 15l4.5-4.5', 'M4.5 19.5h15'],
  chev:     ['M6 9l6 6 6-6'],
  close:    ['M6 6l12 12M18 6 6 18'],
  phone:    ['M8 2.5h8A1.5 1.5 0 0 1 17.5 4v16a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V4A1.5 1.5 0 0 1 8 2.5z', 'M11 18.5h2'],
  book:     ['M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z', 'M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5']
}

const d = computed(() => paths[props.name] || [])
</script>

<template>
  <svg class="ic" viewBox="0 0 24 24" :width="size" :height="size"
       :fill="fill ? 'currentColor' : 'none'" stroke="currentColor"
       :stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true" focusable="false">
    <path v-for="(p, i) in d" :key="i" :d="p" />
    <circle v-if="name === 'wifi'" cx="12" cy="19.6" r=".9" fill="currentColor" stroke="none" />
    <path v-if="name === 'contrast'" d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
  </svg>
</template>

<style scoped>
.ic { display: block; flex: none; }
</style>
