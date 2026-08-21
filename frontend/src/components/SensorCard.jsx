import React from "react";

export default function SensorCard({
  label = "Sensor",
  value = 0,
  unit = "",
  isOffline = false
}) {
  return (
    <div className="bg-[#F1F7F3] border border-[#2D6A4F]/20 rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <span className="text-sm font-semibold text-[#2D6A4F]">{label}</span>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`font-bold ${isOffline ? "text-sm text-gray-500 italic" : "text-2xl text-[#222222]"}`}>
          {isOffline ? "Sensor offline" : value}
        </span>
        {!isOffline && unit && (
          <span className="text-xs font-medium text-gray-600">{unit}</span>
        )}
      </div>
    </div>
  );
}

