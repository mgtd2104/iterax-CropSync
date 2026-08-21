import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNavigate } from "react-router-dom";
import { rtdb } from "../services/firebase";
import { ref, set } from "firebase/database";

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", 
  "Haryana", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
];

const LANGUAGES = [
  "English", "Hindi", "Punjabi", "Tamil", "Telugu", 
  "Marathi", "Bengali", "Gujarati", "Kannada", "Malayalam"
];

const SOIL_TYPES = [
  "Alluvial Soil", "Black Soil (Regur)", "Red & Yellow Soil", 
  "Laterite Soil", "Arid / Sandy Soil", "Clayey Soil"
];

export default function Onboarding() {
  const { user, profile, saveProfile } = useUser();
  const { location, loading: geoLoading, detectLocation } = useGeolocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [stateName, setStateName] = useState(profile?.state || location?.state || "Punjab");
  const [district, setDistrict] = useState(profile?.district || location?.district || "Ludhiana");
  const [language, setLanguage] = useState(profile?.language || "English");
  const [farmingType, setFarmingType] = useState(profile?.farming_type || "Seasonal");

  // Update state/district when location is detected
  useEffect(() => {
    if (location?.state && !profile?.state) {
      setStateName(location.state);
    }
    if (location?.district && !profile?.district) {
      setDistrict(location.district);
    }
  }, [location, profile?.state, profile?.district]);

  // Plot details for seasonal/plantation
  const [plotName, setPlotName] = useState("Plot 1");
  const [soilType, setSoilType] = useState("Alluvial Soil");
  const [landArea, setLandArea] = useState("2.5");
  const [cropType, setCropType] = useState("Wheat");

  const handleSaveProfileAndPlot = async () => {
    setSaving(true);
    setError("");
    try {
      // Save profile
      const profileData = {
        state: stateName,
        district: district,
        language: language,
        farming_type: farmingType,
        is_guest: user?.isAnonymous || false
      };

      await saveProfile(profileData);

      // Save initial plot if user is authenticated and not guest or if guest has temporary plot state
      if (user?.uid && !user.isAnonymous) {
        const plotId = "plot_1";
        const plotRef = ref(rtdb, `users/${user.uid}/plots/${plotId}`);
        await set(plotRef, {
          plot_name: plotName,
          soil_type: soilType,
          land_area: landArea,
          crop_type: cropType,
          crop_category: farmingType === "Plantation" ? "plantation" : "seasonal",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
          fertilizers_used: [],
          disease_history: [],
          irrigation_log: []
        });
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Onboarding save error:", err);
      setError("Failed to save onboarding details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#222222] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#F1F7F3] border border-[#2D6A4F]/20 rounded-xl p-6 shadow-sm">
        <div className="mb-6 border-b border-[#2D6A4F]/20 pb-4 text-center">
          <h1 className="text-2xl font-bold text-[#1B4332]">Farmer Onboarding</h1>
          <p className="text-sm text-gray-600 mt-1">Step {step} of 2 — Customize your farm setup</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#D64545]/10 border border-[#D64545] text-[#D64545] rounded-lg text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-semibold text-[#1B4332]">
                  State & District
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={geoLoading}
                  className="text-xs font-semibold text-[#2D6A4F] hover:underline flex items-center gap-1"
                >
                  {geoLoading ? "Detecting..." : "Auto-Detect Location"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className="p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B4332] mb-1">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B4332] mb-1">
                Farming Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Seasonal", "Plantation", "Both"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFarmingType(type)}
                    className={`py-3 px-2 text-sm font-semibold rounded-lg border transition-colors ${
                      farmingType === type
                        ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                        : "bg-white text-[#222222] border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3 bg-[#2D6A4F] text-white font-semibold rounded-lg hover:bg-[#1B4332] transition-colors"
            >
              Next: Land & Crop Details
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1B4332] mb-1">
                Plot Name
              </label>
              <input
                type="text"
                value={plotName}
                onChange={(e) => setPlotName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                placeholder="e.g. Land A / Field 1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B4332] mb-1">
                Soil Type
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              >
                {SOIL_TYPES.map((soil) => (
                  <option key={soil} value={soil}>
                    {soil}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#1B4332] mb-1">
                  Land Area (Acres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  placeholder="2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1B4332] mb-1">
                  Crop Type
                </label>
                <input
                  type="text"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  placeholder="e.g. Wheat, Rice, Cotton"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSaveProfileAndPlot}
                disabled={saving}
                className="w-2/3 py-3 bg-[#2D6A4F] text-white font-semibold rounded-lg hover:bg-[#1B4332] transition-colors flex items-center justify-center"
              >
                {saving ? "Saving Details..." : "Complete Setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
