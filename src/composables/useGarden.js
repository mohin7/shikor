/* ==========================================================================
   useGarden — the single source of truth for the whole app.
   Owns the MQTT connection, the device state, the history buffer and every
   command the UI can send. Components only read refs and call actions.
   ========================================================================== */

import { reactive, ref, computed } from 'vue'
import mqtt from 'mqtt'
import { t } from './useI18n'

/* ---- settings, remembered per phone ------------------------------------- */
const SETTINGS_KEY = 'shikor.settings.v1'
const HISTORY_KEY  = 'shikor.history.v1'
const LOG_KEY      = 'shikor.log.v1'
const SNOOZE_KEY   = 'shikor.snooze.v1'

const defaults = {
  broker: 'wss://broker.hivemq.com:8884/mqtt',
  base:   'garden/mohin7-4f82b1'
}

/* How long "not now" keeps the app quiet. The device snoozes itself too;
   this is the phone's own copy so an un-flashed device still can't nag. */
const SNOOZE_MS = 4 * 60 * 60 * 1000

function loadJSON (key, fallback) {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || '{}') } }
  catch { return fallback }
}
function loadArray (key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function loadNumber (key) {
  try { return Number(localStorage.getItem(key)) || 0 } catch { return 0 }
}
function saveSafe (key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode */ }
}
function saveRaw (key, value) {
  try { localStorage.setItem(key, String(value)) } catch { /* private mode */ }
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
  state:    'IDLE',    // IDLE | WAITING | WATERING | MANUAL
  auto:     false,
  manual:   false,
  low:      35,
  target:   60,
  max:      20,
  left:     0,         // seconds remaining in the current run
  quiet:    0,         // seconds until the device may ask again
  fault:    false,     // the probe reads impossible values (unplugged / shorted)
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

/* When the user says "not now" we remember it, so the request does not pop
   straight back up on the next telemetry message. */
export const snoozeUntil = ref(loadNumber(SNOOZE_KEY))
export const isSnoozed = computed(() => Date.now() < snoozeUntil.value)

/* one request episode is shown at most once; a genuinely new one re-arms it */
let shownThisEpisode = false

/* ---- history and event log ----------------------------------------------- */
export const history = ref(loadArray(HISTORY_KEY))   // [{t, soil}]
export const log     = ref(loadArray(LOG_KEY))       // [{t, reason, seconds, from, to}]

const HISTORY_MAX = 120
const LOG_MAX     = 40

/* ---- derived ------------------------------------------------------------- */
export const isWatering = computed(() => device.pump || device.state === 'WATERING')
export const isDry      = computed(() => device.seen && !device.fault && device.soil < device.low)
export const isWaiting  = computed(() => device.state === 'WAITING')

export const soilColour = computed(() => {
  const s = device.soil
  if (!device.seen) return 'var(--faint)'
  if (device.fault) return 'var(--danger)'
  if (s < 15) return 'var(--m-0)'
  if (s < 35) return 'var(--m-25)'
  if (s < 55) return 'var(--m-50)'
  if (s < 80) return 'var(--m-75)'
  return 'var(--m-100)'
})

export const soilLabel = computed(() => {
  const s = device.soil
  if (!device.seen) return t('soil.unknown')
  if (device.fault) return t('soil.fault')
  if (s < 15) return t('soil.veryDry')
  if (s < 35) return t('soil.dry')
  if (s < 55) return t('soil.ok')
  if (s < 80) return t('soil.good')
  return t('soil.wet')
})

/* "3 h 59 min" / "৩ ঘণ্টা ৫৯ মিনিট"-style, in the current language */
export function fmtDuration (totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h) return `${h} ${t('unit.h')}${m ? ` ${m} ${t('unit.min')}` : ''}`
  return `${Math.max(1, m)} ${t('unit.min')}`
}

/* how long the app (or the device) stays quiet, in words */
export const quietLabel = computed(() => {
  const fromPhone  = Math.max(0, snoozeUntil.value - Date.now()) / 1000
  const fromDevice = device.quiet || 0
  const s = Math.max(fromPhone, fromDevice)
  if (s <= 0) return ''
  return fmtDuration(Math.round(s / 60) * 60)
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
    const topics = T()
    client.subscribe([topics.data, topics.ask, topics.status], { qos: 0 })
  })

  client.on('reconnect', () => { link.status = 'connecting' })
  client.on('error', (e) => { link.status = 'error'; link.error = String(e?.message || e) })
  client.on('close',  () => { if (link.status === 'connected') link.status = 'connecting' })

  client.on('message', (topic, payload) => {
    const text = payload.toString()
    const topics = T()

    if (topic === topics.status) {
      device.online = text.trim() === 'online'
      if (device.online) device.lastSeen = Date.now()
      return
    }

    let msg
    try { msg = JSON.parse(text) } catch { return }

    /* ---- a fresh permission request ---- */
    if (topic === topics.ask) {
      if (isSnoozed.value) return          // the user already said "not now"
      openAsk(msg.soil ?? device.soil, msg.limit ?? device.low)
      return
    }

    if (topic !== topics.data) return

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
      closeAsk()
      return
    }

    if (typeof msg.soil   === 'number') device.soil   = msg.soil
    if (typeof msg.raw    === 'number') device.raw    = msg.raw
    if (typeof msg.low    === 'number') device.low    = msg.low
    if (typeof msg.target === 'number') device.target = msg.target
    if (typeof msg.max    === 'number') device.max    = msg.max
    if (typeof msg.left   === 'number') device.left   = msg.left
    if (typeof msg.quiet  === 'number') device.quiet  = msg.quiet
    if (typeof msg.rssi   === 'number') device.rssi   = msg.rssi
    if (typeof msg.up     === 'number') device.uptime = msg.up

    device.fault  = !!msg.fault
    device.pump   = !!msg.pump
    device.auto   = !!msg.auto
    device.manual = !!msg.manual
    if (msg.state) device.state = msg.state

    /* The ask message is not retained, so an app opened while the device is
       already waiting would never see it. The retained state fills that gap —
       but only once per episode, and never while snoozed. */
    if (device.state === 'WAITING') {
      if (!ask.open && !shownThisEpisode && !isSnoozed.value) {
        openAsk(device.soil, device.low)
      }
    } else {
      shownThisEpisode = false            // episode over, arm for the next one
      if (ask.open) closeAsk()
    }

    pushHistory(device.soil)
  })
}

function openAsk (soil, limit) {
  ask.open  = true
  ask.soil  = soil
  ask.limit = limit
  ask.at    = Date.now()
  shownThisEpisode = true
}

function closeAsk () {
  ask.open = false
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

function setSnooze (ms) {
  snoozeUntil.value = Date.now() + ms
  saveRaw(SNOOZE_KEY, snoozeUntil.value)
}

export function clearSnooze () {
  snoozeUntil.value = 0
  saveRaw(SNOOZE_KEY, 0)
}

export const actions = {
  water: (seconds) => {
    clearSnooze()                      // watering on purpose ends the quiet period
    closeAsk()
    return send({ cmd: 'water_now', seconds })
  },
  stop    : ()        => send({ cmd: 'stop' }),
  decline : ()        => {
    closeAsk()
    setSnooze(SNOOZE_MS)               // "not now" has to mean not now
    return send({ cmd: 'no' })
  },
  autoOn  : ()        => send({ cmd: 'auto_on' }),
  autoOff : ()        => send({ cmd: 'auto_off' }),
  manualOn: ()        => send({ cmd: 'manual_on' }),
  manualOff:()        => send({ cmd: 'manual_off' }),
  setLimits: (low, target, max) => send({ cmd: 'set', low, target, max }),
  /* let the user re-open the request they parked earlier */
  unsnooze: () => { clearSnooze(); if (device.state === 'WAITING') openAsk(device.soil, device.low) }
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
  if (s < 10) return t('ago.now')
  if (s < 60) return t('ago.s', { n: s })
  const m = Math.floor(s / 60)
  if (m < 60) return t('ago.m', { n: m })
  const h = Math.floor(m / 60)
  if (h < 24) return t('ago.h', { n: h })
  return t('ago.d', { n: Math.floor(h / 24) })
}

export function clockTime (ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/* the device sends its reason in English; map it to a translatable key */
const REASON_KEYS = {
  'app': 'reason.app',
  'auto': 'reason.auto',
  'manual': 'reason.manual',
  'time limit': 'reason.time',
  'target reached': 'reason.target',
  'stopped from app': 'reason.stopped'
}
export function reasonLabel (r) {
  return REASON_KEYS[r] ? t(REASON_KEYS[r]) : r
}
