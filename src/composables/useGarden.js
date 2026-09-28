/* ==========================================================================
   useGarden — the single source of truth for the whole app.
   Owns the MQTT connection, the device state, the history buffer and every
   command the UI can send. Components only read refs and call actions.
   ========================================================================== */

import { reactive, ref, computed } from 'vue'
import mqtt from 'mqtt'

/* ---- settings, remembered per phone ------------------------------------- */
const SETTINGS_KEY = 'shikor.settings.v1'
const HISTORY_KEY  = 'shikor.history.v1'
const LOG_KEY      = 'shikor.log.v1'

const defaults = {
  broker: 'wss://broker.hivemq.com:8884/mqtt',
  base:   'garden/mohin7-4f82b1'
}

function loadJSON (key, fallback) {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || '{}') } }
  catch { return fallback }
}
function loadArray (key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function saveSafe (key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode */ }
}

export const settings = reactive(loadJSON(SETTINGS_KEY, defaults))

/* ---- connection --------------------------------------------------------- */
export const link = reactive({
  status: 'idle',      // idle | connecting | connected | error
  error: ''
})

/* ---- what the device last told us --------------------------------------- */
export const device = reactive({
  seen:     false,     // have we received anything at all
  online:   false,     // from the retained status topic / last will
  soil:     0,
  raw:      0,
  pump:     false,
  state:    'IDLE',    // IDLE | WAITING | WATERING
  auto:     false,
  manual:   false,
  low:      35,
  target:   60,
  max:      20,
  left:     0,         // seconds remaining in the current run
  rssi:     null,
  uptime:   null,
  lastSeen: 0
})

/* ---- a pending "may I water?" request ------------------------------------ */
export const ask = reactive({
  open: false,
  soil: 0,
  limit: 0,
  at: 0
})

/* ---- history and event log ----------------------------------------------- */
export const history = ref(loadArray(HISTORY_KEY))   // [{t, soil}]
export const log     = ref(loadArray(LOG_KEY))       // [{t, reason, seconds, from, to}]

const HISTORY_MAX = 120
const LOG_MAX     = 40

/* ---- derived ------------------------------------------------------------- */
export const isWatering = computed(() => device.pump || device.state === 'WATERING')
export const isDry      = computed(() => device.seen && device.soil < device.low)

export const soilColour = computed(() => {
  const s = device.soil
  if (s < 15) return 'var(--m-0)'
  if (s < 35) return 'var(--m-25)'
  if (s < 55) return 'var(--m-50)'
  if (s < 80) return 'var(--m-75)'
  return 'var(--m-100)'
})

export const soilLabel = computed(() => {
  const s = device.soil
  if (!device.seen) return '—'
  if (s < 15) return 'খুব শুকনো'
  if (s < 35) return 'শুকনো'
  if (s < 55) return 'মোটামুটি'
  if (s < 80) return 'ভালো'
  return 'ভেজা'
})

/* ---- topics -------------------------------------------------------------- */
const T = () => ({
  data:   `${settings.base}/data`,
  ask:    `${settings.base}/ask`,
  cmd:    `${settings.base}/cmd`,
  status: `${settings.base}/status`
})

let client = null
let staleTimer = null

/* ---- connect -------------------------------------------------------------- */
export function connect () {
  disconnect()
  link.status = 'connecting'
  link.error = ''

  const id = 'shikor-' + Math.random().toString(16).slice(2, 10)

  client = mqtt.connect(settings.broker, {
    clientId: id,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 8000,
    keepalive: 30
  })

  client.on('connect', () => {
    link.status = 'connected'
    const t = T()
    client.subscribe([t.data, t.ask, t.status], { qos: 0 })
  })

  client.on('reconnect', () => { link.status = 'connecting' })
  client.on('error', (e) => { link.status = 'error'; link.error = String(e?.message || e) })
  client.on('close',  () => { if (link.status === 'connected') link.status = 'connecting' })

  client.on('message', (topic, payload) => {
    const text = payload.toString()
    const t = T()

    if (topic === t.status) {
      device.online = text.trim() === 'online'
      if (device.online) device.lastSeen = Date.now()
      return
    }

    let msg
    try { msg = JSON.parse(text) } catch { return }

    if (topic === t.ask) {
      ask.open  = true
      ask.soil  = msg.soil ?? device.soil
      ask.limit = msg.limit ?? device.low
      ask.at    = Date.now()
      return
    }

    if (topic !== t.data) return

    device.seen = true
    device.online = true
    device.lastSeen = Date.now()
    armStaleTimer()

    /* a watering event, not a reading */
    if (msg.event === 'watered') {
      pushLog({
        t: Date.now(),
        reason: msg.reason || 'unknown',
        seconds: msg.seconds ?? 0,
        from: msg.from ?? null,
        to: msg.to ?? null
      })
      ask.open = false
      return
    }

    if (typeof msg.soil   === 'number') device.soil   = msg.soil
    if (typeof msg.raw    === 'number') device.raw    = msg.raw
    if (typeof msg.low    === 'number') device.low    = msg.low
    if (typeof msg.target === 'number') device.target = msg.target
    if (typeof msg.max    === 'number') device.max    = msg.max
    if (typeof msg.left   === 'number') device.left   = msg.left
    if (typeof msg.rssi   === 'number') device.rssi   = msg.rssi
    if (typeof msg.up     === 'number') device.uptime = msg.up

    device.pump   = !!msg.pump
    device.auto   = !!msg.auto
    device.manual = !!msg.manual
    if (msg.state) device.state = msg.state

    /* The ask message is not retained, so an app opened after the device
       started waiting would never see it. The retained state tells us. */
    if (device.state === 'WAITING') {
      if (!ask.open) {
        ask.open  = true
        ask.soil  = device.soil
        ask.limit = device.low
        ask.at    = ask.at || Date.now()
      }
    } else {
      ask.open = false
    }

    pushHistory(device.soil)
  })
}

export function disconnect () {
  if (client) { try { client.end(true) } catch {} client = null }
  clearTimeout(staleTimer)
  link.status = 'idle'
}

/* the device speaks every 10s; if 40s pass in silence, call it offline */
function armStaleTimer () {
  clearTimeout(staleTimer)
  staleTimer = setTimeout(() => { device.online = false }, 40000)
}

/* ---- buffers -------------------------------------------------------------- */
let lastHistoryAt = 0
function pushHistory (soil) {
  const now = Date.now()
  if (now - lastHistoryAt < 9000) return       // one point per ~10s, no bursts
  lastHistoryAt = now
  const next = [...history.value, { t: now, soil }].slice(-HISTORY_MAX)
  history.value = next
  saveSafe(HISTORY_KEY, next)
}

function pushLog (entry) {
  const next = [entry, ...log.value].slice(0, LOG_MAX)
  log.value = next
  saveSafe(LOG_KEY, next)
}

export function clearHistory () {
  history.value = []; log.value = []
  saveSafe(HISTORY_KEY, []); saveSafe(LOG_KEY, [])
}

/* ---- sending -------------------------------------------------------------- */
export const lastSent = ref('')

function send (obj) {
  if (!client || link.status !== 'connected') return false
  client.publish(T().cmd, JSON.stringify(obj), { qos: 0 })
  lastSent.value = obj.cmd
  setTimeout(() => { if (lastSent.value === obj.cmd) lastSent.value = '' }, 1200)
  return true
}

export const actions = {
  water   : (seconds) => send({ cmd: 'water_now', seconds }),
  stop    : ()        => send({ cmd: 'stop' }),
  decline : ()        => { ask.open = false; return send({ cmd: 'no' }) },
  autoOn  : ()        => send({ cmd: 'auto_on' }),
  autoOff : ()        => send({ cmd: 'auto_off' }),
  manualOn: ()        => send({ cmd: 'manual_on' }),
  manualOff:()        => send({ cmd: 'manual_off' }),
  setLimits: (low, target, max) => send({ cmd: 'set', low, target, max })
}

/* ---- settings ------------------------------------------------------------- */
export function saveSettings (next) {
  Object.assign(settings, next)
  saveSafe(SETTINGS_KEY, { broker: settings.broker, base: settings.base })
  device.seen = false
  device.online = false
  connect()
}

/* ---- small helpers the UI shares ------------------------------------------ */
export function ago (ts) {
  if (!ts) return '—'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 10) return 'এইমাত্র'
  if (s < 60) return `${s} সেকেন্ড আগে`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} মিনিট আগে`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ঘণ্টা আগে`
  return `${Math.floor(h / 24)} দিন আগে`
}

export function clockTime (ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function reasonLabel (r) {
  return ({
    app: 'অ্যাপ থেকে',
    auto: 'স্বয়ংক্রিয়',
    manual: 'ম্যানুয়াল',
    'time limit': 'সময় শেষ',
    'target reached': 'লক্ষ্যে পৌঁছেছে',
    'stopped from app': 'অ্যাপ থেকে বন্ধ'
  })[r] || r
}
