# Shikor — Smart Garden Water Pump

ব্যালকনি বাগানের স্বয়ংক্রিয় সেচ। মাটির আর্দ্রতা মেপে ESP32 সিদ্ধান্ত নেয়,
আর ফোনের অ্যাপ থেকে যেকোনো জায়গা থেকে নিয়ন্ত্রণ করা যায়।

```
App (wss://broker.hivemq.com:8884/mqtt)  ←→  HiveMQ  ←→  ESP32 (tcp 1883)
```

দুই পাশ একই broker-এ, শুধু আলাদা দরজা দিয়ে ঢোকে — তাই একই Wi-Fi-তে থাকার দরকার নেই।

---

## চালানো

প্রথমবার নিজের ম্যাকে `npm install` চালাতে হবে — dependency-র কিছু অংশ
প্ল্যাটফর্ম-নির্ভর (rollup-এর native binary), তাই অন্য মেশিনের `node_modules`
কপি করে কাজ হয় না।

```bash
npm install
npm run dev        # http://localhost:5173  (--host দেওয়া আছে, ফোন থেকেও খোলা যাবে)
npm run build      # dist/ তৈরি হবে
npm run preview    # build করা ভার্সন দেখতে
```

ফোনে দেখতে: ল্যাপটপ আর ফোন একই Wi-Fi-তে রেখে `npm run dev` চালাও,
টার্মিনালে যে `Network:` ঠিকানাটা দেখাবে সেটা ফোনের ব্রাউজারে খোলো।

---

## ফোল্ডার

```
src/
  styles/tokens.css        সব রঙ, radius, shadow, motion — Light + Dark দুই theme
  styles/base.css          reset, card, slider
  composables/useGarden.js MQTT সংযোগ + ডিভাইসের অবস্থা + সব কমান্ড
  composables/useTheme.js  Light/Dark (ডিফল্ট Light)
  composables/useI18n.js   English/বাংলা (ডিফল্ট English)
  i18n/en.js, bn.js        সব লেখা এখানে — নতুন লেখা যোগ করলে দুই ফাইলেই দিতে হবে
  components/              প্রতিটা কার্ড আলাদা
  App.vue                  তিনটা ট্যাব
firmware/shikor_firmware/  ESP32-র কোড (v3)
public/                    icon, manifest, service worker
```

UI-র চেহারা বদলাতে চাইলে প্রায় সব কিছুই `tokens.css`-এ।

### Theme ও ভাষা

- **ডিফল্ট: Light + English।** Settings → *Appearance* থেকে Dark আর বাংলা চালু করা যায়।
- পছন্দ ফোনে সেভ থাকে (`shikor.theme.v1`, `shikor.lang.v1`) — পরের বার খুললে একই থাকে।
- প্রথম paint-এর আগেই পছন্দ প্রয়োগ হয়, তাই Dark বেছে রাখলে খোলার সময় সাদা ঝলক আসে না।
- সংখ্যা সবসময় ইংরেজি অঙ্কে (0–9) দেখায়, বাংলায়ও।
- নতুন লেখা যোগ করতে: `src/i18n/en.js` আর `bn.js` — দুই জায়গায় একই key; বাংলা না থাকলে English দেখায়।
- iOS-এ status bar style `default` — Light theme-এ সাদা লেখা অদৃশ্য হয়ে যাওয়া এড়াতে।
- Service worker cache এখন `shikor-shell-v2`; আগের ভার্সন ফোনে বসানো থাকলে একবার বন্ধ করে আবার খুললে নতুনটা আসবে
  (না এলে PWA মুছে আবার Add to Home Screen)।

---

## ESP32

1. **Tools → Manage Libraries** থেকে ইনস্টল করো: **"WiFiManager" by tzapu** আর **"PubSubClient" by Nick O'Leary**
2. `firmware/shikor_firmware/shikor_firmware.ino` খোলো
3. Board: **ESP32 Dev Module** · Upload Speed: **115200** → Upload
4. কোডে Wi-Fi লেখার দরকার **নেই** — নিচের setup ধাপ দেখো

### প্রথমবার চালু করা (এবং Wi-Fi বদলানো)

কোডে পাসওয়ার্ড বসানো থাকলে নতুন জায়গায় গেলে প্রতিবার ল্যাপটপ লাগত।
তাই ডিভাইস নিজেই একটা সেটআপ হটস্পট বানায়।

1. পাওয়ার দাও। **একবারও Wi-Fi-তে যুক্ত না হয়ে থাকলে** ডিভাইস **`Shikor-Setup`** নামে
   একটা Wi-Fi ছাড়ে — পাসওয়ার্ড `shikor123`
2. ফোন দিয়ে ওই নেটওয়ার্কে যুক্ত হও; সেটআপ পেজ নিজেই খুলবে
   (না খুললে ব্রাউজারে `http://192.168.4.1`)
3. **Configure WiFi** → নেটওয়ার্ক বেছে নাও → পাসওয়ার্ড → **Save**
4. ডিভাইস রিবুট করে নতুন নেটওয়ার্কে ঢুকে যাবে

একই পেজে **MQTT topic base** ফিল্ডও আছে — অ্যাপের Settings-এর
"টপিক বেস"-এর সাথে **হুবহু এক** রাখতে হবে।

**Wi-Fi বদলাতে / সব ভুলিয়ে দিতে:** ডিভাইস **চালু থাকা অবস্থায়** (লাল → সবুজ LED ঝলকানির পর) **BOOT বোতাম ৩ সেকেন্ড চেপে ধরো**।
দুই LED একসাথে ঝলকাবে, সেভ করা Wi-Fi মুছে যাবে, ডিভাইস রিস্টার্ট হয়ে আবার `Shikor-Setup` হটস্পট খুলবে।
**বোতাম ধরে রেখে পাওয়ার দিও না**, তাতে ESP32 ফ্ল্যাশ-মোডে চলে যায় আর firmware চালুই হয় না।
পাম্প চলার সময় এই বোতাম কাজ করে না (ভুল চাপে সেচ থামবে না)।

**হটস্পট না এলে:** একবার Wi-Fi-তে যুক্ত হয়ে থাকলে ডিভাইস আর নিজে থেকে হটস্পট খোলে না (রাউটার বন্ধ থাকলেও সেচ চলবে বলে)।
তখন উপরের ৩ সেকেন্ড-চাপ দিয়ে হটস্পট চালু করো। ফোনে 2.4 GHz নেটওয়ার্ক তালিকায় `Shikor-Setup` খোঁজো (পাসওয়ার্ড `shikor123`)।

**রাউটার বন্ধ/ডাউন থাকলে:** আগে একবার Wi-Fi-তে যুক্ত হয়ে থাকলে ডিভাইস আর setup হটস্পট খোলে না
(নইলে বাসার রাউটার রিস্টার্টের সময় পাম্প কন্ট্রোল আটকে থাকত)। অফলাইনেই **auto মোড চলতে থাকে**,
আর প্রতি ৩০ সেকেন্ডে Wi-Fi, প্রতি ৫ সেকেন্ডে MQTT আবার চেষ্টা করে — পাম্প চলার সময় কখনো নয়।

### তার লাগানো (wiring)

| ESP32 | কোথায় |
|---|---|
| D34 | সেন্সরের AOUT (VCC → 3V3, GND → GND) |
| D26 | রিলে IN |
| **VIN (5V)** | রিলে DC+ — **3V3 নয়** |
| GND | রিলে DC−, সেন্সর GND, দুই LED-র ছোট পা (কমন) |
| D27 | 🔴 লাল LED → 220 Ω → লম্বা পা (+) |
| D25 | 🟢 সবুজ LED → 220 Ω → লম্বা পা (+) |
| D0 (BOOT) | Wi-Fi রিসেট (চালু অবস্থায় ৩ সেকেন্ড চাপো) |

| LED | কখন জ্বলে |
|---|---|
| 🟢 সবুজ | মাটি শুকনো নয় |
| 🔴 লাল | মাটি শুকনো (আর্দ্রতা < low সীমা) |
| 🔴 ব্লিংক | **সেন্সর ফল্ট** (তার খুলে গেছে / VCC নেই — raw <500 বা >3500); পাম্প অটো চলে না, অ্যাপে "Sensor Fault" |

চালু হওয়ার সময় একবার লাল → সবুজ জ্বলে (self-test) — দুটোই জ্বললে LED আর তার ঠিক আছে।

### পাওয়ার (সবচেয়ে গুরুত্বপূর্ণ)

পাম্প চালু হওয়ার মুহূর্তে বড় কারেন্ট টানে। সাপ্লাই দুর্বল হলে ESP32 **brownout** হয়ে রিবুট করে:
সব LED নিভে যায়, রিলে clack শব্দ করে, Serial Monitor-এ উল্টাপাল্টা লেখা আসে।

- ESP32 চালাও **5V 2A চার্জার** দিয়ে, ল্যাপটপ USB দিয়ে নয়
- পাম্পের জন্য **আলাদা সাপ্লাই**, কিন্তু **GND কমন**
- ESP32-র 5V–GND-তে **470–1000 µF** ক্যাপাসিটর
- পাম্পের দুই তারে **100 nF** সিরামিক ক্যাপাসিটর (পাম্প motor হলে এর সাথে flyback diode, যেমন 1N4007, উল্টো করে)
- রিলের DC+ অবশ্যই **VIN/5V**-এ

### সমস্যা হলে

| লক্ষণ | কারণ / সমাধান |
|---|---|
| Upload ব্যর্থ ("Unable to verify flash chip") | Upload Speed **115200**; অন্য USB তার (ডাটা-তার); Upload চলার সময় BOOT চেপে ধরো |
| Serial Monitor-এ উল্টাপাল্টা লেখা | Monitor-এর baud **115200** করো; পাম্প চালাতেই হলে brownout — উপরের পাওয়ার অংশ |
| পাম্প চালাতেই সব নিভে যায় | brownout — চার্জার/ক্যাপাসিটর/আলাদা পাম্প সাপ্লাই |
| LED জ্বলে না | self-test-এ দেখো; LED উল্টো (লম্বা পা = +); GND কমন আছে কিনা |
| "Water now" দিলেও চলে না | বাটন ধূসর থাকলে ডিভাইস অফলাইন — অ্যাপে কারণ লেখা থাকে |
| পানি দেওয়ার পর আর অটো চলে না | স্বাভাবিক: পানির পর **৬ ঘণ্টা** অপেক্ষা (অ্যাপে "Quiet for …" দেখায়)। রিবুট করলে এই ঘড়ি শূন্য হয় |

### সংস্করণে যা যোগ হয়েছে

| | কেন |
|---|---|
| telemetry এখন **retained** | অ্যাপ খুললেই সাথে সাথে আসল অবস্থা দেখায়, ১০ সেকেন্ড ফাঁকা থাকে না |
| `{"cmd":"set",...}` | অ্যাপ থেকে সীমা বদলানো যায় |
| NVS (Preferences.h) | রিস্টার্ট হলেও সেটিংস থাকে |
| `manual_on` / `manual_off` | টাইমার ছাড়া পাম্প (১০ মিনিটের নিরাপত্তা সীমা সহ) |
| `rssi`, `up`, `left` | Wi-Fi সিগন্যাল, uptime, বাকি সময় |
| active LOW + high-Z | 3.3V লজিক দিয়ে 5V opto রিলে চালানোর সমস্যার সমাধান |
| **WiFiManager captive portal** | নতুন জায়গায় Wi-Fi বদলাতে আর ল্যাপটপ লাগে না |
| **টপিকও ফোন থেকে বদলানো যায়** | সেটআপ পেজের বাড়তি ফিল্ড, NVS-এ জমা থাকে |
| লাল/সবুজ LED | মাটির অবস্থা ডিভাইসেই দেখা যায় |
| LED self-test | চালুর সময় লাল → সবুজ, তার ঠিক আছে কিনা বোঝা যায় |
| অফলাইন-ফার্স্ট Wi-Fi | রাউটার না থাকলেও auto সেচ চলে |
| সেন্সর ফল্ট সুরক্ষা | বিচ্ছিন্ন সেন্সর "শুকনো" পড়ে অকারণে পাম্প চালানো ঠেকায় |
| snooze (৪ ঘণ্টা) | "না" বললে বা অপেক্ষা-অবস্থায় stop করলে ৪ ঘণ্টা আর জিজ্ঞেস করে না |
| অনুমোদন ৩০ মিনিটে মেয়াদ শেষ | উত্তর না এলে অনুরোধ নিজে বাতিল হয়; মাটি ভিজে গেলেও বাতিল |
| `max` সীমা সব জায়গায় প্রযোজ্য | অ্যাপ থেকে বেশি সেকেন্ড চাইলেও `max`-এ কেটে দেয়, অ্যাপ সেটা জানিয়ে দেয় |

### কমান্ড

```
garden/<base>/cmd
  {"cmd":"water_now","seconds":10}   (max সীমায় কাটা পড়ে)
  {"cmd":"stop"}
  {"cmd":"no"}
  {"cmd":"manual_on"}  {"cmd":"manual_off"}
  {"cmd":"auto_on"}    {"cmd":"auto_off"}
  {"cmd":"set","low":30,"target":65,"max":25}
  {"cmd":"ping"}
```

---

## Android APK (Capacitor)

PWA দাঁড়ানোর পর ১০ মিনিটের কাজ:

```bash
npm i -D @capacitor/cli && npm i @capacitor/core @capacitor/android
npx cap init Shikor com.mohin.shikor --web-dir=dist
npm run build
npx cap add android
npx cap sync
npx cap open android        # Android Studio খুলবে → Build → APK
```

iOS-এর জন্য `@capacitor/ios` — Xcode লাগবে, আর ফোনে বসাতে Apple Developer অ্যাকাউন্ট।

---

## Cloudflare Pages-এ দেওয়া

রিপো private হলেও চলবে।

1. Cloudflare Dashboard → **Workers & Pages** → Create → **Pages** → Connect to Git
2. GitHub-এ ঢুকে এই private রিপোটা বেছে নাও
3. সেটিংস:

| | |
|---|---|
| Framework preset | None (বা Vue) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION` = `22` |

4. Deploy → তারপর **Custom domains** ট্যাব থেকে নিজের ডোমেইন যোগ করো

`public/_redirects` ফাইলটা SPA fallback-এর জন্য — Cloudflare এটা নিজে থেকে পড়ে নেয়।
HTTPS Cloudflare এমনিতেই দেয়, তাই `wss://` কাজ করবে।

### git শুরু

```bash
cd ~/Desktop/garden-iot
git init && git add . && git commit -m "Shikor v1.1"
git branch -M main
git remote add origin git@github.com:mohin7/<repo-name>.git
git push -u origin main
```

`node_modules/` আর `dist/` `.gitignore`-এ আছে — ওগুলো যাবে না, Cloudflare নিজে build করবে।

---

## সীমাবদ্ধতা (রিপোর্টে লেখার জন্য)

1. **অ্যাপ বন্ধ থাকলে push notification আসে না।** MQTT-র জন্য কানেকশন খোলা থাকতে হয়।
   আসল push-এর জন্য FCM + একটা ছোট server bridge দরকার — *Future Scope*।
2. **পাবলিক broker-এ কোনো authentication নেই।** টপিকের নাম জানলে যে কেউ পাম্প চালাতে পারবে।
   এখন নামের সাথে একটা random অংশ জোড়া আছে; আসল সমাধান HiveMQ Cloud-এর free tier
   (username/password + TLS) — *Future Scope*।
3. **ইতিহাস ফোনে জমা হয়**, ডিভাইসে নয় — অ্যাপ খোলা না থাকলে ওই সময়ের রিডিং জমে না।
   সমাধান: ESP32-তে SD card বা একটা time-series backend — *Future Scope*।
4. মিনি 5V পাম্পের lift ≈ 40–110 cm, তাই পানির পাত্র টবের কাছাকাছি রাখতে হয়।
5. **ট্যাঙ্ক খালি হলে** ডিভাইস বুঝতে পারে না — পাম্প শুকনো চলবে (সর্বোচ্চ `max` সেকেন্ড)।
   Future Scope: water-level সেন্সর।
6. **পাওয়ার কাটলে ৬ ঘণ্টার ন্যূনতম ব্যবধানের হিসাব শূন্য থেকে শুরু হয়** — রিস্টার্টের পর
   মাটি শুকনো থাকলে সাথে সাথে অনুমোদন চাইবে/পানি দেবে।
7. সেটআপ হটস্পটের পাসওয়ার্ড কোডে লেখা (`shikor123`) — কেউ কাছে থাকলে ওটা দিয়ে
   ডিভাইসের Wi-Fi সেটিংসে ঢুকতে পারবে। *Future Scope*: প্রতি ডিভাইসে আলাদা
   পাসওয়ার্ড, chip ID থেকে তৈরি।

---

v1.1 · Mohin Uddin
