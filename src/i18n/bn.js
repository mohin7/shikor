/* বাংলা — keys must match en.js exactly. Numbers stay in Latin digits. */
export default {
  /* tabs */
  'tab.home': 'হোম',
  'tab.history': 'ইতিহাস',
  'tab.settings': 'সেটিংস',

  /* header status pill */
  'status.failed': 'সংযোগ ব্যর্থ',
  'status.connecting': 'যুক্ত হচ্ছে…',
  'status.searching': 'ডিভাইস খুঁজছি…',
  'status.offline': 'ডিভাইস অফলাইন',
  'status.online': 'অনলাইন',
  'status.reload': 'রিলোড',

  /* banners on Home */
  'banner.broker': 'ব্রোকারে যুক্ত হওয়া যাচ্ছে না — ইন্টারনেট দেখো।',
  'banner.silent': 'ডিভাইস সাড়া দিচ্ছে না — ESP32-তে পাওয়ার আছে তো?',
  'banner.dry': 'মাটি শুকনো — {soil}%, সীমা {low}%',
  'banner.fault': 'সেন্সরে সমস্যা — প্রোবের তার ঠিক আছে কিনা দেখো। স্বয়ংক্রিয় পানি দেওয়া বন্ধ আছে।',
  'parked.title': 'অনুরোধ পরে দেখতে বলেছ',
  'parked.sub': '{time} চুপ থাকবে · দেখতে চাপো',

  /* soil labels */
  'soil.unknown': 'ডিভাইসের অপেক্ষায়',
  'soil.veryDry': 'খুব শুকনো',
  'soil.dry': 'শুকনো',
  'soil.ok': 'মোটামুটি',
  'soil.good': 'ভালো',
  'soil.wet': 'ভেজা',
  'soil.fault': 'সেন্সর সমস্যা',
  'gauge.raw': 'raw',
  'scene.tap': 'ট্যাপ করলে পানি পড়বে',
  'scene.watering': 'পানি দেওয়া হচ্ছে…',

  /* main action */
  'action.water': 'পানি দাও',
  'action.stop': 'বন্ধ করো',
  'action.notConnected': 'সংযোগ নেই',
  'action.deviceOffline': 'ডিভাইস অফলাইন',
  'action.hint.title': 'পাম্পের সাথে যোগাযোগ হচ্ছে না',
  'action.hint.body': 'ESP32-তে পাওয়ার আর Wi-Fi আছে কিনা দেখো, আর অ্যাপের টপিক বেস ডিভাইসের সেটআপ পেজের সাথে হুবহু মিলছে কিনা দেখো।',
  'action.hint.broker': 'অ্যাপ broker-এ পৌঁছাতে পারছে না। ইন্টারনেট সংযোগ দেখো।',
  'action.hint.open': 'সেটিংস খোলো',
  'action.left': '{n}s বাকি',
  'action.running': 'চলছে',
  'action.emergency': 'জরুরি বন্ধ',

  /* duration */
  'dur.title': 'কতক্ষণ',
  'dur.custom': 'নিজে',
  'dur.summary': 'পাম্প {n} সেকেন্ড চলবে।',
  'dur.capped': 'ডিভাইস প্রতিবার {max}s-এর বেশি চালায় না। বেশিক্ষণ চালাতে সেটিংস → পানি দেওয়ার নিয়ম থেকে বাড়াও।',

  /* mode */
  'mode.title': 'স্বয়ংক্রিয় পানি',
  'mode.advanced': 'অ্যাডভান্সড',
  'scene.moisture': 'মাটির আর্দ্রতা',
  'scene.last': 'শেষবার পানি দেওয়া হয়েছে {time}',
  'mode.auto.title': 'জিজ্ঞেস না করেই পানি দাও',
  'mode.auto.on': 'চালু — মাটি শুকালে নিজেই পানি দেবে। বাইরে গেলে কাজে লাগবে।',
  'mode.auto.off': 'বন্ধ — মাটি শুকালে আগে তোমার অনুমতি চাইবে।',
  'mode.manual.title': 'ম্যানুয়াল পাম্প',
  'mode.manual.desc': 'টাইমার ছাড়া চালু থাকবে — নিজে বন্ধ না করা পর্যন্ত।',
  'mode.manual.warn': 'ম্যানুয়াল মোডে নির্দিষ্ট টাইমার নেই। সর্বোচ্চ ১০ মিনিট পরে নিজেই বন্ধ হবে — কাজ শেষে নিজে বন্ধ করো।',

  /* limits */
  'lim.title': 'পানি দেওয়ার নিয়ম',
  'lim.saving': 'সংরক্ষণ হচ্ছে…',
  'lim.low': 'শুকনো ধরা হবে',
  'lim.low.hint': 'এর নিচে নামলে ডিভাইস পানি দিতে চাইবে।',
  'lim.target': 'লক্ষ্য আর্দ্রতা',
  'lim.target.hint': 'স্বয়ংক্রিয়ভাবে পানি দিলে এই মাত্রায় পৌঁছালে পাম্প নিজেই থামবে।',
  'lim.max': 'সর্বোচ্চ রান টাইম',
  'lim.max.hint': 'একবারে এর বেশি সময় পাম্প চলবে না — নিরাপত্তা সীমা।',

  /* permission sheet */
  'ask.title': 'মাটি শুকিয়ে গেছে',
  'ask.pre': 'এখন আর্দ্রতা ',
  'ask.mid': ', তোমার ঠিক করা সীমা ',
  'ask.post': '। এখনই পানি দেব?',
  'ask.timer': 'উত্তর না দিলে {clock} পরে অনুরোধ বাতিল হবে',
  'ask.no': 'এখন না',
  'ask.yes': 'হ্যাঁ, {n}s দাও',

  /* history */
  'hist.title': 'আর্দ্রতার গতিপথ',
  'hist.empty': 'অ্যাপ খোলা রাখলে এখানে রিডিং জমতে থাকবে।',
  'hist.moisture': 'আর্দ্রতা',
  'hist.dryLimit': 'শুকনো সীমা ({low}%)',
  'log.title': 'পানি দেওয়ার হিসাব',
  'log.clear': 'মুছে ফেলো',
  'log.empty': 'এখনো কোনো রেকর্ড নেই। একবার পানি দিলে এখানে জমা হবে।',
  'reason.app': 'অ্যাপ থেকে',
  'reason.auto': 'স্বয়ংক্রিয়',
  'reason.manual': 'ম্যানুয়াল',
  'reason.time': 'সময় শেষ',
  'reason.target': 'লক্ষ্যে পৌঁছেছে',
  'reason.stopped': 'অ্যাপ থেকে বন্ধ',

  /* device card */
  'dev.title': 'ডিভাইস',
  'dev.state': 'অবস্থা',
  'dev.online': 'অনলাইন',
  'dev.offline': 'অফলাইন',
  'dev.lastSeen': 'শেষ খবর',
  'dev.wifi': 'Wi-Fi সিগন্যাল',
  'dev.wifi.excellent': 'চমৎকার',
  'dev.wifi.good': 'ভালো',
  'dev.wifi.weak': 'দুর্বল',
  'dev.wifi.veryWeak': 'খুব দুর্বল',
  'dev.uptime': 'চালু আছে',
  'dev.sensor': 'সেন্সর',
  'dev.sensor.ok': 'ঠিক আছে',
  'dev.sensor.fault': 'সমস্যা',
  'dev.raw': 'সেন্সর রিডিং',
  'dev.raw.hint': 'raw 0–4095 · কম মানে বেশি ভেজা',
  'dev.broker': 'ব্রোকার',
  'link.idle': 'অপেক্ষায়',
  'link.connecting': 'যুক্ত হচ্ছে',
  'link.connected': 'যুক্ত',
  'link.error': 'ত্রুটি',

  /* connection card */
  'conn.title': 'সংযোগ',
  'conn.broker': 'MQTT ব্রোকার (WebSocket)',
  'conn.topic': 'টপিক বেস',
  'conn.note': 'ESP32-র সেটআপ পেজের “MQTT topic base” ঠিক এই লেখাটাই হতে হবে। পাবলিক ব্রোকারে কোনো পাসওয়ার্ড নেই — টপিকের নাম যে জানে সে-ই পাম্প চালাতে পারবে, তাই নামটা অনুমান করা কঠিন রাখো।',
  'conn.apply': 'প্রয়োগ করে আবার যুক্ত হও',
  'conn.saved': 'সংরক্ষিত ✓',

  /* appearance + about */
  'look.title': 'চেহারা',
  'look.theme': 'থিম',
  'look.light': 'লাইট',
  'look.dark': 'ডার্ক',
  'look.lang': 'ভাষা',
  'look.toDark': 'ডার্ক মোডে যাও',
  'look.toLight': 'লাইট মোডে যাও',
  'look.toLang': 'View in English',
  'about.body': 'ব্যালকনি বাগানের জন্য স্বয়ংক্রিয় সেচ। মাটির আর্দ্রতা মেপে ESP32 সিদ্ধান্ত নেয়, আর তুমি যেখানেই থাকো — অনুমতি দাও বা নিজে পানি দাও।',
  'about.install': 'ফোনে অ্যাপের মতো রাখতে: ব্রাউজারের শেয়ার মেনু →',
  'about.version': 'v1.1 · Mohin Uddin',

  /* units */
  'unit.h': 'ঘণ্টা',
  'unit.min': 'মিনিট',
  'ago.now': 'এইমাত্র',
  'ago.s': '{n} সেকেন্ড আগে',
  'ago.m': '{n} মিনিট আগে',
  'ago.h': '{n} ঘণ্টা আগে',
  'ago.d': '{n} দিন আগে'
}
