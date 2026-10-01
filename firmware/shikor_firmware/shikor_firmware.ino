/*
  ============================================================
  Shikor — Smart Garden Water Pump  ·  firmware v3
  Board : ESP32 DevKit (CH340, USB-C)
  ============================================================

  WHAT IT DOES
    Reads a capacitive soil sensor every 5 s. When the soil is dry it asks the
    phone app for permission (or, in "water without asking" mode, just waters),
    runs the pump through a relay, and stops at the target moisture or after a
    time limit. Red / green LEDs show the soil state on the device itself.

  WI-FI WITHOUT A LAPTOP
    On first boot (or after a reset) the device puts up its own hotspot called
    "Shikor-Setup" (password: shikor123). Join it from a phone; a setup page
    opens by itself. Pick the Wi-Fi, type the password, Save. The device
    remembers it and reboots into the network.
    To change the network later: hold the BOOT button for 3 seconds while the
    device is running (both LEDs flash, then it restarts into setup mode).
    Do NOT hold BOOT while plugging in: that puts the ESP32 into its flashing
    mode and the firmware never starts.
    Once a network is saved, a router that is switched off or out of range
    does NOT trap the device in setup mode: it keeps sensing, showing the
    LEDs and watering on its own, and rejoins the network when it returns.

  WIRING
    Sensor  VCC -> 3V3     GND -> GND     AOUT -> D34
    Relay   DC+ -> VIN (5V, NOT 3V3)   DC- -> GND     IN -> D26
    Relay   COM -> pump supply (+)                    NO -> pump (+)
    Pump    (-) -> supply GND                         NC -> empty
    GREEN LED  D25 -> 220R -> LED (long leg) ... short leg -> GND   soil OK
    RED   LED  D27 -> 220R -> LED (long leg) ... short leg -> GND   soil DRY
    (dry = below the "low" limit, 35% by default. The LEDs run on the device
     itself, so they work with no Wi-Fi and no phone.)

  POWER  (the usual reason for random resets when the pump starts)
    · Run the ESP32 from a 5V 2A phone charger, not a laptop USB port.
    · Best: give the pump its own supply (power bank / 5V adapter) and join
      the two grounds. The relay then only switches the pump's wire.
    · 470-1000 uF across the ESP32's 5V and GND, 100 nF across the pump's two
      terminals, and a diode (1N4007, stripe toward +) across the pump help.
    If the ESP32 does reset, the relay falls back to OFF by itself.

  BEFORE UPLOADING
    Tools -> Manage Libraries -> install "WiFiManager" by tzapu
                              and "PubSubClient" by Nick O'Leary
    Tools -> Upload Speed -> 115200 (921600 often fails on cheap USB cables).
    Nothing else. Wi-Fi and the topic are set from the phone.
*/

#include <WiFi.h>
#include <WiFiManager.h>          // tzapu/WiFiManager
#include <PubSubClient.h>
#include <Preferences.h>

// ============================================================
//  CONFIG — everything you might want to change is in this block
// ============================================================

// ---- pins ----
#define SOIL_PIN   34      // sensor AOUT  (input only, ADC1)
#define RELAY_PIN  26      // relay IN
#define LED_GREEN  25      // soil OK  (not dry)
#define LED_RED    27      // soil DRY (blinks on a sensor fault)
#define RESET_PIN  0       // the BOOT button

// ---- sensor calibration (measured on this probe with the Serial Plotter) ----
const int DRY_VALUE = 2586;    // probe in dry air
const int WET_VALUE = 1178;    // probe in water, up to the white line
// A healthy probe stays between roughly 1100 (water) and 2600 (air). Near 0 means
// unpowered or shorted (it would read "100% wet" and never water); near 4095
// means the signal is tied high. Outside this window the reading is not trusted.
const int FAULT_BELOW = 500;
const int FAULT_ABOVE = 3500;

// ---- network ----
#define SETUP_AP_NAME "Shikor-Setup"
#define SETUP_AP_PASS "shikor123"     // at least 8 characters
const char*    MQTT_HOST = "broker.hivemq.com";
const uint16_t MQTT_PORT = 1883;

// The public broker has no password: anyone who knows this string can run the
// pump. Keep the random part, and put the same string in the app's Settings.
// It can also be changed from the setup page, without a laptop.
char topicBase[48] = "garden/mohin7-4f82b1";

// ---- timing (milliseconds) ----
const unsigned long MIN_INTERVAL     = 6UL * 3600UL * 1000UL;  // gap between two waterings
const unsigned long SNOOZE_TIME      = 4UL * 3600UL * 1000UL;  // quiet period after "not now"
const unsigned long APPROVAL_TIMEOUT = 30UL * 60UL * 1000UL;   // a request expires on its own
const unsigned long MANUAL_SAFETY    = 10UL * 60UL * 1000UL;   // manual mode hard stop
const unsigned long SENSOR_EVERY     = 5000UL;    // read the soil
const unsigned long SEND_EVERY_IDLE  = 10000UL;   // telemetry, pump off
const unsigned long SEND_EVERY_PUMP  = 2000UL;    // telemetry, pump on
const unsigned long MQTT_RETRY_EVERY = 5000UL;    // broker unreachable
const unsigned long WIFI_RETRY_EVERY = 30000UL;   // router away
/* While testing it helps to shorten the long ones — 60000UL is one minute.
   Put them back before leaving the device on the balcony. */

// ============================================================
//  state
// ============================================================

// limits below are the defaults; the app can change them and they are stored in flash
Preferences prefs;
int  LOW_LIMIT    = 35;     // % below this the soil counts as dry
int  TARGET       = 60;     // % stop the pump at this level
int  MAX_RUN_TIME = 20;     // seconds, hard limit for one timed run
bool autoMode     = false;  // true = water by itself ("water without asking")
bool wifiEverOk   = false;  // true once a network has been joined; see connectWiFi()

WiFiClient   net;
PubSubClient mqtt(net);

char T_DATA[64], T_ASK[64], T_CMD[64], T_STATUS[64];

enum State { IDLE, WAITING, WATERING, MANUAL };
State state = IDLE;
const char* stateName[] = {"IDLE", "WAITING", "WATERING", "MANUAL"};

int  soil = 0, soilAtStart = 0, rawSoil = 0;
int  runSeconds = 0;
bool honourTarget = true;      // false for a run the user asked for by hand
bool sensorFault  = false;     // probe reads impossible values (unplugged / shorted)
unsigned long tRead = 0, tSend = 0, tPumpStart = 0, tAsk = 0, tLastWater = 0;
unsigned long tSnooze = 0;     // set when the user answers "not now"
unsigned long tWifiNudge = 0, tMqttTry = 0;

inline bool isPumping() { return state == WATERING || state == MANUAL; }

void buildTopics() {
  snprintf(T_DATA,   sizeof(T_DATA),   "%s/data",   topicBase);
  snprintf(T_ASK,    sizeof(T_ASK),    "%s/ask",    topicBase);
  snprintf(T_CMD,    sizeof(T_CMD),    "%s/cmd",    topicBase);
  snprintf(T_STATUS, sizeof(T_STATUS), "%s/status", topicBase);
}

// ============================================================
//  relay  —  active LOW, high-impedance when off
//  The module's optocoupler is built for 5V logic. Driven from a 3.3V pin,
//  a "HIGH" still leaves ~1.7V across the opto LED, so it never fully turns
//  off and the coil stays latched. Floating the pin removes the path entirely.
// ============================================================
inline void relayWrite(bool on) {
  if (on) { pinMode(RELAY_PIN, OUTPUT); digitalWrite(RELAY_PIN, LOW); }
  else    { pinMode(RELAY_PIN, INPUT); }
}

// ============================================================
//  status LEDs  —  purely local, they never affect the pump.
//    red = soil dry      green = soil not dry      red blinking = sensor fault
// ============================================================
void updateLeds() {
  if (sensorFault) {
    digitalWrite(LED_RED, (millis() / 400) % 2);
    digitalWrite(LED_GREEN, LOW);
    return;
  }
  bool dry = soil < LOW_LIMIT;
  digitalWrite(LED_RED,   dry ? HIGH : LOW);
  digitalWrite(LED_GREEN, dry ? LOW  : HIGH);
}

// Red, then green, at power-up. If one never lights, the fault is that LED's
// wiring (polarity, resistor, pin, GND), not the code.
void ledSelfTest() {
  const int leds[2] = { LED_RED, LED_GREEN };
  for (int i = 0; i < 2; i++) {
    digitalWrite(leds[i], HIGH);
    delay(350);
    digitalWrite(leds[i], LOW);
  }
}

// ============================================================
//  tiny JSON readers  —  enough for the flat messages we exchange
// ============================================================
static int jsonInt(const String& s, const char* key, int fallback) {
  String needle = String("\"") + key + "\"";
  int k = s.indexOf(needle);
  if (k < 0) return fallback;
  int c = s.indexOf(':', k + needle.length());
  if (c < 0) return fallback;
  return s.substring(c + 1).toInt();
}

static String jsonStr(const String& s, const char* key) {
  String needle = String("\"") + key + "\"";
  int k = s.indexOf(needle);
  if (k < 0) return "";
  int c = s.indexOf(':', k + needle.length());
  if (c < 0) return "";
  int q1 = s.indexOf('"', c);
  if (q1 < 0) return "";
  int q2 = s.indexOf('"', q1 + 1);
  if (q2 < 0) return "";
  return s.substring(q1 + 1, q2);
}

// ============================================================
//  settings persistence
// ============================================================
void loadSettings() {
  prefs.begin("shikor", false);
  LOW_LIMIT    = prefs.getInt("low",    LOW_LIMIT);
  TARGET       = prefs.getInt("target", TARGET);
  MAX_RUN_TIME = prefs.getInt("max",    MAX_RUN_TIME);
  autoMode     = prefs.getBool("auto",  autoMode);
  wifiEverOk   = prefs.getBool("wifiok", false);
  String t     = prefs.getString("topic", topicBase);
  if (t.length() > 3 && t.length() < sizeof(topicBase)) {
    strncpy(topicBase, t.c_str(), sizeof(topicBase) - 1);
    topicBase[sizeof(topicBase) - 1] = '\0';
  }
  prefs.end();
}

void saveSettings() {
  prefs.begin("shikor", false);
  prefs.putInt("low",    LOW_LIMIT);
  prefs.putInt("target", TARGET);
  prefs.putInt("max",    MAX_RUN_TIME);
  prefs.putBool("auto",  autoMode);
  prefs.putBool("wifiok", wifiEverOk);
  prefs.putString("topic", topicBase);
  prefs.end();
}

// ============================================================
//  sensor and timers
// ============================================================
int readSoil() {
  long sum = 0;
  for (int i = 0; i < 10; i++) {          // average 10 readings = steadier
    sum += analogRead(SOIL_PIN);
    delay(5);
  }
  rawSoil = sum / 10;
  sensorFault = (rawSoil < FAULT_BELOW || rawSoil > FAULT_ABOVE);
  // capacitive sensor: HIGH raw = dry, LOW raw = wet
  int pct = map(rawSoil, DRY_VALUE, WET_VALUE, 0, 100);
  return constrain(pct, 0, 100);
}

// seconds until the device is allowed to ask again (0 = free to ask)
long quietFor() {
  unsigned long now = millis();
  long a = 0, b = 0;
  if (tLastWater && now - tLastWater < MIN_INTERVAL)
    a = (MIN_INTERVAL - (now - tLastWater)) / 1000UL;
  if (tSnooze && now - tSnooze < SNOOZE_TIME)
    b = (SNOOZE_TIME  - (now - tSnooze))    / 1000UL;
  return a > b ? a : b;
}

// how many seconds are left in the current timed run
int secondsLeft() {
  if (state != WATERING) return 0;
  long gone = (millis() - tPumpStart) / 1000;
  long left = (long)runSeconds - gone;
  return left > 0 ? (int)left : 0;
}

// ============================================================
//  telemetry
// ============================================================
void sendData() {
  char msg[260];
  snprintf(msg, sizeof(msg),
    "{\"soil\":%d,\"raw\":%d,\"pump\":%d,\"state\":\"%s\",\"auto\":%s,\"manual\":%s,"
    "\"low\":%d,\"target\":%d,\"max\":%d,\"left\":%d,\"quiet\":%ld,"
    "\"fault\":%d,\"rssi\":%d,\"up\":%lu}",
    soil, rawSoil,
    isPumping() ? 1 : 0,
    stateName[state],
    autoMode ? "true" : "false",
    (state == MANUAL) ? "true" : "false",
    LOW_LIMIT, TARGET, MAX_RUN_TIME, secondsLeft(), quietFor(),
    sensorFault ? 1 : 0, (int)WiFi.RSSI(), millis() / 1000UL);

  mqtt.publish(T_DATA, msg, true);        // RETAINED: the app sees state at once
  Serial.print("[send] ");
  Serial.println(msg);
}

void sendEvent(const char* why, int ran) {
  char msg[170];
  snprintf(msg, sizeof(msg),
    "{\"event\":\"watered\",\"reason\":\"%s\",\"seconds\":%d,\"from\":%d,\"to\":%d}",
    why, ran, soilAtStart, soil);
  mqtt.publish(T_DATA, msg);              // not retained — it is a one-off
  Serial.print("[event] ");
  Serial.println(msg);
}

// ============================================================
//  pump
// ============================================================
void pumpOn(int seconds, const char* why) {
  tSnooze      = 0;                            // an explicit watering clears "not now"
  honourTarget = (strcmp(why, "app") != 0);    // a run asked for by hand is not cut short by the target
  runSeconds   = constrain(seconds, 1, MAX_RUN_TIME);
  soilAtStart  = soil;
  tPumpStart   = millis();
  relayWrite(true);
  state = WATERING;
  Serial.printf(">> PUMP ON  (%s, %d s)\n", why, runSeconds);
  sendData();
}

void manualOn() {
  soilAtStart = soil;
  tPumpStart  = millis();
  relayWrite(true);
  state = MANUAL;
  Serial.println(">> MANUAL ON");
  sendData();
}

// The one place the relay goes off after a run. `event` is the reason the app's
// history shows ("manual" for a manual run, otherwise why it stopped).
void endRun(const char* why, const char* event) {
  int ran = (millis() - tPumpStart) / 1000;
  const char* label = (state == MANUAL) ? "MANUAL" : "PUMP";
  relayWrite(false);
  state      = IDLE;
  tLastWater = millis();
  Serial.printf(">> %s OFF (%s)  ran %ds,  soil %d%% -> %d%%\n",
                label, why, ran, soilAtStart, soil);
  sendEvent(event, ran);
  sendData();
}

void pumpOff(const char* why)   { endRun(why, why); }
void manualOff(const char* why) { endRun(why, "manual"); }

void stopAnything(const char* why) {
  if (state == WATERING)    pumpOff(why);
  else if (state == MANUAL) manualOff(why);
  else {
    if (state == WAITING) tSnooze = millis();   // cancelling a request must not re-ask at once
    state = IDLE;
    sendData();
  }
}

// ============================================================
//  permission request
// ============================================================
void askPermission() {
  state = WAITING;
  tAsk  = millis();
  char msg[110];
  snprintf(msg, sizeof(msg),
           "{\"ask\":\"water?\",\"soil\":%d,\"limit\":%d}", soil, LOW_LIMIT);
  mqtt.publish(T_ASK, msg);
  Serial.println("[ask] soil is dry - waiting for the user's answer");
  sendData();
}

// ============================================================
//  incoming commands
// ============================================================
void onMessage(char* topic, byte* payload, unsigned int len) {
  String body;
  body.reserve(len + 1);
  for (unsigned int i = 0; i < len; i++) body += (char)payload[i];
  Serial.print("[recv] ");
  Serial.println(body);

  String cmd = jsonStr(body, "cmd");
  if (cmd.length() == 0) return;

  if (cmd == "water_now") {
    int sec = jsonInt(body, "seconds", MAX_RUN_TIME);
    if (state == MANUAL) manualOff("switched to timed");
    pumpOn(sec, "app");
  }
  else if (cmd == "stop") {
    stopAnything("stopped from app");
  }
  else if (cmd == "no") {
    // Without this the device would see dry soil again on the very next loop
    // and ask straight away. "Not now" has to mean not now.
    if (state == WAITING) {
      state   = IDLE;
      tSnooze = millis();
      Serial.printf("user said not now - quiet for %lu hours\n",
                    SNOOZE_TIME / 3600000UL);
      sendData();
    }
  }
  else if (cmd == "manual_on")  { if (state != MANUAL) manualOn(); }
  else if (cmd == "manual_off") { if (state == MANUAL) manualOff("app"); }
  else if (cmd == "auto_on")    {
    autoMode = true;
    tSnooze  = 0;                              // must not sit out an old "not now"
    if (state == WAITING) state = IDLE;        // ...nor wait for a question nobody will answer
    saveSettings(); sendData();
  }
  else if (cmd == "auto_off")   { autoMode = false; saveSettings(); sendData(); }
  else if (cmd == "set") {
    LOW_LIMIT    = constrain(jsonInt(body, "low",    LOW_LIMIT),    5,  90);
    TARGET       = constrain(jsonInt(body, "target", TARGET),      10,  99);
    MAX_RUN_TIME = constrain(jsonInt(body, "max",    MAX_RUN_TIME), 1, 120);
    if (TARGET <= LOW_LIMIT) TARGET = (LOW_LIMIT + 5 > 99) ? 99 : LOW_LIMIT + 5;
    saveSettings();
    Serial.printf("[set] low=%d target=%d max=%d\n", LOW_LIMIT, TARGET, MAX_RUN_TIME);
    sendData();
  }
  else if (cmd == "ping") {
    sendData();
  }
}

// ============================================================
//  BOOT button  —  hold 3 s while running to forget the saved Wi-Fi
//  (Holding it at power-up would start the ESP32's flashing mode instead.)
//  Ignored while the pump runs, so a bump can never interrupt watering.
// ============================================================
const unsigned long BOOT_HOLD_MS = 3000UL;
unsigned long tBootDown = 0;

void forgetWiFiAndRestart() {
  Serial.println("[wifi] BOOT held 3 s - forgetting the saved network");
  for (int i = 0; i < 6; i++) {                // both LEDs flash: "got it"
    digitalWrite(LED_RED,   i % 2 == 0);
    digitalWrite(LED_GREEN, i % 2 == 0);
    delay(150);
  }
  WiFiManager wm;
  wm.resetSettings();
  wifiEverOk = false;
  saveSettings();
  delay(200);
  ESP.restart();                                // boots straight into the setup hotspot
}

void checkBootButton() {
  if (digitalRead(RESET_PIN) != LOW) { tBootDown = 0; return; }
  if (isPumping())                   { tBootDown = 0; return; }
  if (tBootDown == 0) tBootDown = millis();
  else if (millis() - tBootDown >= BOOT_HOLD_MS) forgetWiFiAndRestart();
}

// ============================================================
//  connectivity
// ============================================================
void startPortal(const char* why) {
  Serial.printf("\n[wifi] %s\n", why);
  Serial.println("[wifi] join \"" SETUP_AP_NAME "\" (password " SETUP_AP_PASS ")");
  Serial.println("[wifi] a setup page should open by itself");
}

// Returns true when joined. A device that has never joined a network opens the
// setup hotspot and waits for a phone (nothing to water yet, so blocking is
// fine). A device that HAS joined one before never does: if the router is off
// or away it returns false after ~20 s and the caller carries on offline, so
// the sensor, the LEDs and the auto-watering keep running.
bool connectWiFi() {
  WiFi.mode(WIFI_STA);

  WiFiManager wm;
  wm.setDebugOutput(false);
  wm.setConfigPortalTimeout(300);        // 5 minutes, then reboot and retry
  wm.setConnectTimeout(20);
  wm.setEnableConfigPortal(!wifiEverOk);

  // one extra field on the setup page, so the topic is changeable too
  WiFiManagerParameter p_topic("topic", "MQTT topic base", topicBase,
                               sizeof(topicBase) - 1);
  wm.addParameter(&p_topic);

  if (!wifiEverOk) startPortal("no saved network - opening the setup hotspot");
  else             Serial.println("[wifi] joining the saved network...");

  if (!wm.autoConnect(SETUP_AP_NAME, SETUP_AP_PASS)) {
    if (!wifiEverOk) {
      Serial.println("[wifi] setup timed out - restarting");
      delay(1000);
      ESP.restart();
    }
    Serial.println("[wifi] saved network not in reach - running offline, will keep trying");
    return false;
  }

  if (!wifiEverOk) { wifiEverOk = true; saveSettings(); }

  // the field may have been edited on the setup page
  const char* t = p_topic.getValue();
  if (t && strlen(t) > 3 && strcmp(t, topicBase) != 0) {
    strncpy(topicBase, t, sizeof(topicBase) - 1);
    topicBase[sizeof(topicBase) - 1] = '\0';
    saveSettings();
    Serial.printf("[wifi] topic set to %s\n", topicBase);
  }
  buildTopics();

  Serial.print("[wifi] connected to ");
  Serial.print(WiFi.SSID());
  Serial.print(", IP ");
  Serial.println(WiFi.localIP());
  return true;
}

// One attempt per call. The loop retries every few seconds, so a dead broker
// or a dead internet link never freezes the sensor / pump logic.
void connectMQTT() {
  if (mqtt.connected()) return;
  String id = "shikor-esp32-" + String((uint32_t)ESP.getEfuseMac(), HEX);
  Serial.print("MQTT...");
  // last will: if this device disappears, the app is told straight away
  if (mqtt.connect(id.c_str(), NULL, NULL, T_STATUS, 0, true, "offline")) {
    Serial.println(" connected");
    mqtt.publish(T_STATUS, "online", true);
    mqtt.subscribe(T_CMD);
    sendData();
  } else {
    Serial.printf(" failed rc=%d, will retry\n", mqtt.state());
  }
}

// Network upkeep. It must never stop the sensor, LEDs or pump timers: with no
// Wi-Fi the device still waters and still shows red/green. A command handled in
// mqtt.loop() may start the pump, which is why loop() takes its clock reading
// only after this has run.
void networkUpkeep() {
  if (WiFi.status() == WL_CONNECTED) {
    if (mqtt.connected()) {
      mqtt.loop();
    } else if (!isPumping() && millis() - tMqttTry >= MQTT_RETRY_EVERY) {
      tMqttTry = millis();                 // one quiet attempt, never while pumping
      connectMQTT();
    }
  } else if (millis() - tWifiNudge >= WIFI_RETRY_EVERY) {
    tWifiNudge = millis();                 // router away: nudge the radio now and then
    WiFi.reconnect();
  }
}

// ============================================================
//  the decision logic, one state at a time
// ============================================================
void runStateMachine(unsigned long now) {
  switch (state) {

    case IDLE:
      // a broken probe must never start the pump (it would read "wet" or "dry" at random)
      if (!sensorFault && soil < LOW_LIMIT && quietFor() == 0) {
        if (autoMode) pumpOn(MAX_RUN_TIME, "auto");
        else          askPermission();
      }
      break;

    case WAITING:
      if (now - tAsk > APPROVAL_TIMEOUT) {      // nobody answered
        state   = IDLE;
        tSnooze = millis();                     // don't nag - try again later
        Serial.println("request expired - going quiet");
        sendData();
      } else if (soil >= LOW_LIMIT + 5) {       // rain, or watered by hand: no longer needed
        state = IDLE;
        Serial.println("soil recovered - request withdrawn");
        sendData();
      }
      break;

    case WATERING:
      if (honourTarget && !sensorFault && soil >= TARGET) pumpOff("target reached");
      else if (now - tPumpStart >= (unsigned long)runSeconds * 1000UL)
                                                         pumpOff("time limit");
      break;

    case MANUAL:
      // no timer by design, but never let the pump run away
      if (now - tPumpStart >= MANUAL_SAFETY) manualOff("safety limit");
      break;
  }
}

// ============================================================
//  setup / loop
// ============================================================
void setup() {
  Serial.begin(115200);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED,   OUTPUT);
  pinMode(RESET_PIN, INPUT_PULLUP);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED,   LOW);
  relayWrite(false);                 // pump OFF at boot — always
  ledSelfTest();
  delay(300);

  Serial.println("\n=== Shikor — Smart Garden Water Pump (v3) ===");
  Serial.println("relay: ACTIVE LOW, high-Z when off");

  loadSettings();
  Serial.printf("settings: low=%d target=%d max=%ds auto=%s\n",
                LOW_LIMIT, TARGET, MAX_RUN_TIME, autoMode ? "on" : "off");
  buildTopics();
  Serial.printf("topic  : %s\n", topicBase);

  // read the soil first, so the LEDs already tell the truth while Wi-Fi connects
  soil = readSoil();
  updateLeds();

  connectWiFi();                     // false = router away; the loop keeps trying
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onMessage);
  mqtt.setBufferSize(384);           // the telemetry payload is bigger than the default
  if (WiFi.status() == WL_CONNECTED) connectMQTT();
}

void loop() {
  checkBootButton();
  networkUpkeep();

  // Take the time only AFTER the network part. A command handled above can have
  // set tPumpStart a few ms "in the future" of an older reading, and the
  // unsigned subtraction in the state machine would then wrap and stop the pump
  // at once.
  unsigned long now = millis();

  if (now - tRead >= SENSOR_EVERY) {
    tRead = now;
    soil = readSoil();
    Serial.printf("raw=%4d   soil=%3d%%%s\n", rawSoil, soil,
                  sensorFault ? "   SENSOR FAULT - check the probe wiring" : "");
  }
  updateLeds();                      // every pass, so the fault blink is smooth

  runStateMachine(now);

  if (now - tSend >= (isPumping() ? SEND_EVERY_PUMP : SEND_EVERY_IDLE)) {
    tSend = now;
    sendData();
  }
}

/*
  ------------------------------------------------------------
  COMMANDS the app (or any MQTT client) can publish to
    garden/<topic base>/cmd
  ------------------------------------------------------------
    {"cmd":"water_now","seconds":10}   run for 10 seconds (capped at "max")
    {"cmd":"stop"}                     stop right now
    {"cmd":"no"}                       answer "not now" to a request
    {"cmd":"manual_on"}                run until told to stop (10 min hard limit)
    {"cmd":"manual_off"}               stop manual mode
    {"cmd":"auto_on"}                  water without asking
    {"cmd":"auto_off"}                 back to asking permission
    {"cmd":"set","low":30,"target":65,"max":25}
    {"cmd":"ping"}                     push a fresh reading

  ------------------------------------------------------------
  CHANGING THE Wi-Fi LATER, WITHOUT A LAPTOP
  ------------------------------------------------------------
  1. Power the device normally, wait for the red then green LED flash, then
     hold the BOOT button for 3 seconds. Both LEDs flash, the saved network is
     forgotten and the setup hotspot opens. (Moving the device somewhere
     the old router is out of range is NOT enough: by design it keeps running
     offline instead of waiting in setup mode.)
  2. On a phone, join the Wi-Fi network "Shikor-Setup" (password shikor123).
  3. A setup page opens by itself. If it does not, open http://192.168.4.1
  4. Configure WiFi -> pick the network -> type the password -> Save.
     The "MQTT topic base" field on the same page can be changed too.
  5. The device reboots and joins the new network. Nothing to re-upload.
*/
