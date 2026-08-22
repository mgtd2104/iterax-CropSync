#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <DHT.h>

// ================= WIFI =================
#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ================= FIREBASE =================
#define API_KEY "YOUR_FIREBASE_WEB_API_KEY"
#define USER_EMAIL "YOUR_FIREBASE_AUTH_EMAIL"
#define USER_PASSWORD "YOUR_FIREBASE_AUTH_PASSWORD"
#define DATABASE_URL "https://YOUR_PROJECT-default-rtdb.firebaseio.com/"

// ================= SENSORS =================
#define SOIL_PIN 34
#define RAIN_AO 32
#define RAIN_DO 33
#define DHT_PIN 4
#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE);

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

String basePath = "/devices/esp32_unit_1/sensors/";

void setup() {
  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  pinMode(RAIN_DO, INPUT);
  dht.begin();

  Serial.println("Firebase initializing...");
}

void loop() {
  if (Firebase.ready()) {
    int soilRaw = analogRead(SOIL_PIN);
    int rainRaw = analogRead(RAIN_AO);
    int rainDigital = digitalRead(RAIN_DO);
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    int moisturePercent = map(soilRaw, 126, 4095, 100, 0);
    moisturePercent = constrain(moisturePercent, 0, 100);
    bool rainDetected = (rainDigital == LOW);

    Serial.println("----------------------------");
    Serial.print("Soil raw: "); Serial.println(soilRaw);
    Serial.print("Moisture %: "); Serial.println(moisturePercent);
    Serial.print("Rain raw: "); Serial.println(rainRaw);
    Serial.print("Rain detected: "); Serial.println(rainDetected ? "YES" : "NO");
    Serial.print("Temperature: "); Serial.println(temperature);
    Serial.print("Humidity: "); Serial.println(humidity);

    Firebase.RTDB.setFloat(&fbdo, basePath + "air_temp_c", temperature);
    Firebase.RTDB.setFloat(&fbdo, basePath + "humidity_pct", humidity);
    Firebase.RTDB.setInt(&fbdo, basePath + "moisture_pct", moisturePercent);
    Firebase.RTDB.setBool(&fbdo, basePath + "rain_detected", rainDetected);
    Firebase.RTDB.setInt(&fbdo, basePath + "rain_intensity", rainRaw);
    Firebase.RTDB.setInt(&fbdo, basePath + "timestamp", millis() / 1000);

    Serial.println("Firebase updated!");
    delay(5000);
  }
}