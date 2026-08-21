import React from "react";

export default function CropCard({
  plot_name = "Plot 1",
  crop_type = "Crop",
  crop_category = "General",
  start_date = "N/A",
  end_date = "N/A"
}) {
  return (
    <div className="bg-[#F1F7F3] text-[#222222] border border-[#2D6A4F]/20 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-[#1B4332]">{plot_name}</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2D6A4F]/15 text-[#1B4332] border border-[#2D6A4F]/30 uppercase tracking-wide">
            {crop_category}
          </span>
        </div>

        <p className="text-xl font-bold text-[#2D6A4F] mb-4">{crop_type}</p>

        <div className="space-y-1 text-xs text-[#222222] bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Start Date:</span>
            <span className="font-semibold">{start_date || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">End Date:</span>
            <span className="font-semibold">{end_date || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

