/* English — the default. Keep the keys identical to bn.js. */
export default {
  /* tabs */
  'tab.home': 'Home',
  'tab.history': 'History',
  'tab.settings': 'Settings',

  /* header status pill */
  'status.failed': 'Link failed',
  'status.connecting': 'Connecting…',
  'status.searching': 'Finding device…',
  'status.offline': 'Device offline',
  'status.online': 'Online',
  'status.reload': 'Reload',

  /* banners on Home */
  'banner.broker': "Can't reach the broker — check your internet.",
  'banner.silent': "The device isn't responding — is the ESP32 powered?",
  'banner.dry': 'Soil is dry — {soil}%, limit {low}%',
  'banner.fault': 'Sensor problem — check the probe wiring. Automatic watering is paused.',
  'parked.title': 'You asked to be reminded later',
  'parked.sub': 'Quiet for {time} · tap to review',

  /* soil labels */
  'soil.unknown': 'Waiting for device',
  'soil.veryDry': 'Very dry',
  'soil.dry': 'Dry',
  'soil.ok': 'Moderate',
  'soil.good': 'Good',
  'soil.wet': 'Wet',
  'soil.fault': 'Sensor fault',
  'gauge.raw': 'raw',
  'scene.tap': 'Tap for a drop',
  'scene.watering': 'Watering…',

  /* main action */
  'action.water': 'Water now',
  'action.stop': 'Stop',
  'action.notConnected': 'Not connected',
  'action.deviceOffline': 'Device offline',
  'action.hint.title': 'Can’t reach the pump yet',
  'action.hint.body': 'Check that the ESP32 has power and Wi-Fi, and that the topic base here matches the one on its setup page.',
  'action.hint.broker': 'The app can’t reach the broker. Check your internet connection.',
  'action.hint.open': 'Open Settings',
  'action.left': '{n}s left',
  'action.running': 'Running',
  'action.emergency': 'Emergency stop',

  /* duration */
  'dur.title': 'Duration',
  'dur.custom': 'Custom',
  'dur.summary': 'The pump will run for {n} seconds.',
  'dur.capped': 'The device stops every run at {max}s. Raise the limit under Settings → Watering rules to run longer.',

  /* mode */
  'mode.title': 'Auto watering',
  'mode.advanced': 'Advanced',
  'scene.moisture': 'Soil moisture',
  'scene.last': 'Last watered {time}',
  'mode.auto.title': 'Water without asking',
  'mode.auto.on': 'On — waters by itself when the soil dries. Good for trips.',
  'mode.auto.off': 'Off — the app asks your permission first when the soil dries.',
  'mode.manual.title': 'Manual pump',
  'mode.manual.desc': 'Runs without a timer until you switch it off.',
  'mode.manual.warn': 'Manual mode has no run timer. It stops by itself after 10 minutes at most — switch it off when you’re done.',

  /* limits */
  'lim.title': 'Watering rules',
  'lim.saving': 'Saving…',
  'lim.low': 'Count as dry below',
  'lim.low.hint': 'Below this, the device will want to water.',
  'lim.target': 'Target moisture',
  'lim.target.hint': 'Automatic waterings stop by themselves at this level.',
  'lim.max': 'Max run time',
  'lim.max.hint': 'The pump never runs longer than this in one go — a safety limit.',

  /* permission sheet */
  'ask.title': 'The soil is dry',
  'ask.pre': 'Moisture is now ',
  'ask.mid': ', your limit is ',
  'ask.post': '. Water now?',
  'ask.timer': 'The request expires in {clock} if you don’t answer',
  'ask.no': 'Not now',
  'ask.yes': 'Yes, water {n}s',

  /* history */
  'hist.title': 'Moisture trend',
  'hist.empty': 'Keep the app open and readings will collect here.',
  'hist.moisture': 'Moisture',
  'hist.dryLimit': 'Dry limit ({low}%)',
  'log.title': 'Watering log',
  'log.clear': 'Clear',
  'log.empty': 'Nothing recorded yet. Your first watering will show up here.',
  'reason.app': 'From the app',
  'reason.auto': 'Automatic',
  'reason.manual': 'Manual',
  'reason.time': 'Time limit reached',
  'reason.target': 'Target reached',
  'reason.stopped': 'Stopped from the app',

  /* device card */
  'dev.title': 'Device',
  'dev.state': 'Status',
  'dev.online': 'Online',
  'dev.offline': 'Offline',
  'dev.lastSeen': 'Last heard',
  'dev.wifi': 'Wi-Fi signal',
  'dev.wifi.excellent': 'Excellent',
  'dev.wifi.good': 'Good',
  'dev.wifi.weak': 'Weak',
  'dev.wifi.veryWeak': 'Very weak',
  'dev.uptime': 'Uptime',
  'dev.sensor': 'Sensor',
  'dev.sensor.ok': 'Working',
  'dev.sensor.fault': 'Fault',
  'dev.raw': 'Sensor reading',
  'dev.raw.hint': 'raw 0–4095 · lower means wetter',
  'dev.broker': 'Broker',
  'link.idle': 'Idle',
  'link.connecting': 'Connecting',
  'link.connected': 'Connected',
  'link.error': 'Error',

  /* connection card */
  'conn.title': 'Connection',
  'conn.broker': 'MQTT broker (WebSocket)',
  'conn.topic': 'Topic base',
  'conn.note': 'The ESP32 must use exactly this topic base (it is set on the device’s setup page). The public broker has no password — anyone who knows the topic name can run the pump, so keep it hard to guess.',
  'conn.apply': 'Apply and reconnect',
  'conn.saved': 'Saved ✓',

  /* appearance + about */
  'look.title': 'Appearance',
  'look.theme': 'Theme',
  'look.light': 'Light',
  'look.dark': 'Dark',
  'look.lang': 'Language',
  'look.toDark': 'Switch to dark mode',
  'look.toLight': 'Switch to light mode',
  'look.toLang': 'বাংলায় দেখো',
  'about.body': 'Automatic watering for your balcony garden. The ESP32 reads the soil and decides — you give permission or water by hand, from wherever you are.',
  'about.install': 'To keep it on your phone like an app: open the browser’s share menu →',
  'about.version': 'v1.1 · Mohin Uddin',

  /* units */
  'unit.h': 'h',
  'unit.min': 'min',
  'ago.now': 'just now',
  'ago.s': '{n}s ago',
  'ago.m': '{n} min ago',
  'ago.h': '{n} h ago',
  'ago.d': '{n} d ago'
}
