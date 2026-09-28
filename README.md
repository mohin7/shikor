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
  styles/tokens.css        সব রঙ, radius, shadow, motion — এক জায়গায়
  styles/base.css          reset, card, slider
  composables/useGarden.js MQTT সংযোগ + ডিভাইসের অবস্থা + সব কমান্ড
  components/              প্রতিটা কার্ড আলাদা
  App.vue                  তিনটা ট্যাব
firmware/shikor_firmware/  ESP32-র কোড (v2)
public/                    icon, manifest, service worker
```

UI-র চেহারা বদলাতে চাইলে প্রায় সব কিছুই `tokens.css`-এ।

---

## ESP32

1. **Tools → Manage Libraries → "WiFiManager" by tzapu** ইনস্টল করো
2. `firmware/shikor_firmware/shikor_firmware.ino` খোলো
3. Board: **ESP32 Dev Module** · Upload Speed: **115200** → Upload
4. কোডে Wi-Fi লেখার দরকার **নেই** — নিচের setup ধাপ দেখো

### প্রথমবার চালু করা (এবং Wi-Fi বদলানো)

কোডে পাসওয়ার্ড বসানো থাকলে নতুন জায়গায় গেলে প্রতিবার ল্যাপটপ লাগত।
তাই ডিভাইস নিজেই একটা সেটআপ হটস্পট বানায়।

1. পাওয়ার দাও। সেভ করা নেটওয়ার্ক না পেলে ডিভাইস **`Shikor-Setup`** নামে
   একটা Wi-Fi ছাড়ে — পাসওয়ার্ড `shikor123`
2. ফোন দিয়ে ওই নেটওয়ার্কে যুক্ত হও; সেটআপ পেজ নিজেই খুলবে
   (না খুললে ব্রাউজারে `http://192.168.4.1`)
3. **Configure WiFi** → নেটওয়ার্ক বেছে নাও → পাসওয়ার্ড → **Save**
4. ডিভাইস রিবুট করে নতুন নেটওয়ার্কে ঢুকে যাবে

একই পেজে **MQTT topic base** ফিল্ডও আছে — অ্যাপের Settings-এর
"টপিক বেস"-এর সাথে **হুবহু এক** রাখতে হবে।

**সব ভুলিয়ে দিতে:** BOOT বোতাম চেপে ধরে পাওয়ার দাও — সেভ করা Wi-Fi মুছে
যাবে, আবার `Shikor-Setup` হটস্পট আসবে।

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

### কমান্ড

```
garden/<base>/cmd
  {"cmd":"water_now","seconds":10}
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
git init && git add . && git commit -m "Shikor v1.0"
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
5. সেটআপ হটস্পটের পাসওয়ার্ড কোডে লেখা (`shikor123`) — কেউ কাছে থাকলে ওটা দিয়ে
   ডিভাইসের Wi-Fi সেটিংসে ঢুকতে পারবে। *Future Scope*: প্রতি ডিভাইসে আলাদা
   পাসওয়ার্ড, chip ID থেকে তৈরি।

---

v1.0 · Mohin Uddin
