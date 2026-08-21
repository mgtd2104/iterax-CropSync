import React from "react";

export default function AlertToast({ alerts, isOffline }) {
  const activeAlerts = [];

  if (isOffline) {
    activeAlerts.push({
      id: "offline",
      type: "critical",
      title: "Sensor Offline",
      message: "No signal received from ESP32 field unit in the last 5 minutes."
    });
  }

  if (alerts?.low_moisture) {
    activeAlerts.push({
      id: "low_moisture",
      type: "warning",
      title: "Low Soil Moisture",
      message: "Soil moisture is below optimal threshold. Irrigation recommended."
    });
  }

  if (alerts?.tank_empty) {
    activeAlerts.push({
      id: "tank_empty",
      type: "critical",
      title: "Water Tank Empty",
      message: "Water supply tank level is critical. Please refill tank immediately."
    });
  }

  if (alerts?.rain_warning) {
    activeAlerts.push({
      id: "rain_warning",
      type: "warning",
      title: "Rain Detected / Forecast",
      message: "Rain activity recorded. Automated irrigation paused to avoid waterlogging."
    });
  }

  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
            alert.type === "critical"
              ? "bg-[#D64545]/10 border-[#D64545] text-[#222222]"
              : "bg-[#F4A300]/10 border-[#F4A300] text-[#222222]"
          }`}
        >
          <div className="text-xl shrink-0 mt-0.5">
            {alert.type === "critical" ? "⚠️" : "🌧️"}
          </div>
          <div>
            <h4
              className={`font-bold text-sm ${
                alert.type === "critical" ? "text-[#D64545]" : "text-[#B37800]"
              }`}
            >
              {alert.title}
            </h4>
            <p className="text-xs mt-0.5 text-[#222222] font-medium">
              {alert.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
