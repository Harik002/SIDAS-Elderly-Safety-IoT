#include <WiFi.h>
#include <HTTPClient.h>

// WiFi (Laptop Hotspot)
const char* ssid = "LAPTOP-HARI 1833";
const char* password = "12345678";

// Server (Laptop IP)
const char* serverURL = "http://192.168.137.1:3000/alert";

// Pins
const int soundPin = 34;   // AO pin
const int ledPin = 26;
const int buzzerPin = 27;

// Threshold (IMPORTANT → adjust this)
int threshold = 2000;

unsigned long lastAlertTime = 0;
const int cooldown = 3000;

void setup() {
  Serial.begin(115200);

  pinMode(ledPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi Connected");
  Serial.println(WiFi.localIP());
}

void loop() {
  int soundValue = analogRead(soundPin);

  Serial.println(soundValue); // 🔥 IMPORTANT for calibration

  if (soundValue > threshold) {
    unsigned long currentTime = millis();

    if (currentTime - lastAlertTime > cooldown) {

      Serial.println("🚨 SOUND DETECTED!");

      digitalWrite(ledPin, HIGH);
      digitalWrite(buzzerPin, HIGH);

      sendAlert();

      delay(2000);

      digitalWrite(ledPin, LOW);
      digitalWrite(buzzerPin, LOW);

      lastAlertTime = currentTime;
    }
  }

  delay(200);
}

void sendAlert() {
  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"alertType\":\"SOUND_DETECTED\"}";

    int code = http.POST(json);

    Serial.print("HTTP Response: ");
    Serial.println(code);

    http.end();
  }
}