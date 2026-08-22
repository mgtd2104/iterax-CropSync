import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { rtdb } from "../services/firebase";
import { ref, onValue, push } from "firebase/database";
import CropCard from "../components/CropCard";
import SensorCard from "../components/SensorCard";
import AlertToast from "../components/AlertToast";

// MOCK DATA - replace with real plots
const MOCK_PLOTS = [
  {
    id: "mock1",
    plot_name: "North Field - Plot 1",
    crop_type: "Wheat",
    crop_category: "Seasonal",
    start_date: "2026-06-01",
    end_date: "2026-10-15"
  },
  {
    id: "mock2",
    plot_name: "South Orchard - Plot 2",
    crop_type: "Mango",
    crop_category: "Plantation",
    start_date: "2024-02-10",
    end_date: "Ongoing"
  },
  {
    id: "mock3",
    plot_name: "East Field - Plot 3",
    crop_type: "Rice",
    crop_category: "Seasonal",
    start_date: "2026-07-01",
    end_date: "2026-11-20"
  }
];

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export default function Dashboard() {
  const { user, profile, logout } = useUser();
  const navigate = useNavigate();

  const [plots, setPlots] = useState([]);
  const [usingMockPlots, setUsingMockPlots] = useState(false);
  const [plotsLoading, setPlotsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sensors, setSensors] = useState(null);
  const [sensorLoading, setSensorLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [hasReceivedData, setHasReceivedData] = useState(false);

  const [advisoryText, setAdvisoryText] = useState("");
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryUsedByGuest, setAdvisoryUsedByGuest] = useState(() => {
    const count = parseInt(localStorage.getItem("guest_advisory_count") || "0", 10);
    return count >= 2;
  });
  const [cropFilter, setCropFilter] = useState("All");

  // Add Crop Modal
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [newCrop, setNewCrop] = useState({
    plot_name: "",
    crop_type: "",
    crop_category: "Seasonal",
    start_date: "",
    end_date: ""
  });
  const [addCropLoading, setAddCropLoading] = useState(false);

  useEffect(() => {
    const sensorRef = ref(rtdb, "devices/esp32_unit_1/sensors");
    let timeoutId = setTimeout(() => {
      setSensorLoading(false);
    }, 3000);
    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        clearTimeout(timeoutId);
        if (snapshot.exists()) {
          const val = snapshot.val();
          setSensors({
            rain_detected: val.rain_detected,
            air_temp_c: val.air_temp_c,
            humidity_pct: val.humidity_pct,
            light_pct: val.light_pct,
            tank_level_pct: val.tank_level_pct,
            soil_moisture_pct: val.soil_moisture_pct,
            timestamp: val.timestamp
          });
          setHasReceivedData(true);
          const ts = typeof val.timestamp === "number"
            ? val.timestamp
            : new Date(val.timestamp || 0).getTime();
          setIsOffline(!ts || Date.now() - ts > FIVE_MINUTES_MS);
        } else {
          setSensors(null);
          setIsOffline(false);
        }
        setSensorLoading(false);
      },
      (err) => {
        clearTimeout(timeoutId);
        console.error("Sensor listener error:", err);
        setIsOffline(true);
        setSensorLoading(false);
      }
    );
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubPlots = () => {};
    let timeoutId = setTimeout(() => {
      setPlotsLoading(false);
    }, 5000);

    try {
      if (user?.uid) {
        const plotsRef = ref(rtdb, `users/${user.uid}/plots`);
        unsubPlots = onValue(
          plotsRef,
          (snapshot) => {
            clearTimeout(timeoutId);
            if (snapshot.exists()) {
              const val = snapshot.val();
              const plotList = Object.keys(val).map((key) => ({
                id: key,
                ...val[key]
              }));
              if (plotList.length > 0) {
                setPlots(plotList);
                setUsingMockPlots(false);
              } else {
                setPlots(MOCK_PLOTS);
                setUsingMockPlots(true);
              }
            } else {
              setPlots(MOCK_PLOTS);
              setUsingMockPlots(true);
            }
            setPlotsLoading(false);
          },
          (err) => {
            clearTimeout(timeoutId);
            console.error("Failed to load plots:", err);
            setError("Failed to load crop plots from database.");
            setPlots(MOCK_PLOTS);
            setUsingMockPlots(true);
            setPlotsLoading(false);
          }
        );
      } else {
        clearTimeout(timeoutId);
        setPlots(MOCK_PLOTS);
        setUsingMockPlots(true);
        setPlotsLoading(false);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Firebase connection error:", err);
      setError("Error initializing real-time connection.");
      setPlotsLoading(false);
    }

    return () => {
      clearTimeout(timeoutId);
      unsubPlots();
    };
  }, [user]);

  const loading = plotsLoading || sensorLoading;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!newCrop.plot_name || !newCrop.crop_type || !newCrop.start_date) return;

    setAddCropLoading(true);
    try {
      const plotsRef = ref(rtdb, `users/${user.uid}/plots`);
      await push(plotsRef, {
        plot_name: newCrop.plot_name,
        crop_type: newCrop.crop_type,
        crop_category: newCrop.crop_category,
        start_date: newCrop.start_date,
        end_date: newCrop.end_date || "Ongoing",
        created_at: Date.now()
      });
      setShowAddCropModal(false);
      setNewCrop({ plot_name: "", crop_type: "", crop_category: "Seasonal", start_date: "", end_date: "" });
      alert("Crop added successfully!");
    } catch (err) {
      console.error("Error adding crop:", err);
      alert("Failed to add crop. Please try again.");
    } finally {
      setAddCropLoading(false);
    }
  };

  const allPlots = usingMockPlots ? MOCK_PLOTS : plots;
  const activePlots =
    cropFilter === "All"
      ? allPlots
      : allPlots.filter((p) => p.crop_category.toLowerCase() === cropFilter.toLowerCase());

  const fetchAdvisory = async () => {
    const isGuest = user?.isAnonymous || profile?.is_guest;
    if (isGuest && advisoryUsedByGuest) return;
    setAdvisoryLoading(true);
    try {
      const response = await fetch("https://iterax-cropsync.onrender.com/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sensor_data: sensors,
          crop_type: activePlots[0]?.crop_type,
          soil_type: "loam",
          language: "English"
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
      const data = await response.json();
      setAdvisoryText(data.advisory_text);
      if (isGuest) {
        const newCount = (parseInt(localStorage.getItem("guest_advisory_count") || "0", 10)) + 1;
        localStorage.setItem("guest_advisory_count", newCount.toString());
        if (newCount >= 2) setAdvisoryUsedByGuest(true);
      }
    } catch (err) {
      console.error("Error fetching advisory:", err);
    } finally {
      setAdvisoryLoading(false);
    }
  };

  const sensorCardsList = [
    {
      label: "Rain Status",
      value: sensors?.rain_detected ? "Rain Detected" : "No Rain",
      unit: ""
    },
    {
      label: "Air Temperature",
      value: `${sensors?.air_temp_c ?? 0}`,
      unit: "°C"
    },
    {
      label: "Humidity",
      value: `${sensors?.humidity_pct ?? 0}`,
      unit: "%"
    },
    {
      label: "Light Intensity",
      value: `${sensors?.light_pct ?? 0}`,
      unit: "%"
    },
    {
      label: "Water Tank Level",
      value: `${sensors?.tank_level_pct ?? 0}`,
      unit: "%"
    },
    {
      label: "Soil Moisture",
      value: `${sensors?.soil_moisture_pct ?? 0}`,
      unit: "%"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2D6A4F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#1B4332]">Loading AgriSense Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8FAF7] text-[#222222] p-4 md:p-8">
        {/* Header */}
        <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#F1F7F3] border border-[#2D6A4F]/20 rounded-xl p-5 mb-8 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1B4332]">AgriSense Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome, {user?.isAnonymous ? "Guest Farmer" : profile?.district ? `${profile.district}, ${profile.state}` : user?.email || "Farmer"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/chat")}
              className="px-4 py-2 text-sm border border-[#2D6A4F] text-[#2D6A4F] font-semibold rounded-xl hover:bg-[#2D6A4F]/10 transition-colors"
            >
              AI Chat
            </button>
            <button
              onClick={() => navigate("/disease-detection")}
              className="px-4 py-2 text-sm border border-[#2D6A4F] text-[#2D6A4F] font-semibold rounded-xl hover:bg-[#2D6A4F]/10 transition-colors"
            >
              Disease Detection
            </button>
            <button
              onClick={() => navigate("/documents")}
              className="px-4 py-2 text-sm border border-[#2D6A4F] text-[#2D6A4F] font-semibold rounded-xl hover:bg-[#2D6A4F]/10 transition-colors"
            >
              Documents
            </button>
            <button
              onClick={() => navigate("/onboarding")}
              className="px-4 py-2 text-sm border border-[#2D6A4F] text-[#2D6A4F] font-semibold rounded-xl hover:bg-[#2D6A4F]/10 transition-colors"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-[#D64545] text-white font-semibold rounded-xl hover:bg-[#D64545]/90 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Error Alert Banner */}
        {error && (
          <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">×</button>
          </div>
        )}

        <div className="max-w-7xl mx-auto space-y-10">
          {/* Section 1: Crop Cards */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1B4332]">Crop Plots</h2>
              <div className="flex items-center gap-2">
                {usingMockPlots && (
                  <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2.5 py-1 rounded-md border border-amber-200">
                    Displaying Mock Plots
                  </span>
                )}
                <button
                  onClick={() => setShowAddCropModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#2D6A4F] text-white font-semibold rounded-xl hover:bg-[#1B4332] transition-colors"
                  aria-label="Add new crop plot"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Crop
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {["All", "Seasonal", "Plantation"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCropFilter(opt)}
                  className={`px-4 py-1.5 text-sm rounded-xl font-semibold transition-colors ${
                    cropFilter === opt
                      ? "bg-[#2D6A4F] text-white"
                      : "bg-white text-[#1B4332] border border-[#2D6A4F]/30 hover:bg-[#2D6A4F]/10"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activePlots.map((plot) => (
                <CropCard
                  key={plot.id}
                  plot_name={plot.plot_name}
                  crop_type={plot.crop_type}
                  crop_category={plot.crop_category}
                  start_date={plot.start_date}
                  end_date={plot.end_date}
                />
              ))}
              {/* Add Crop Card */}
              <button
                onClick={() => setShowAddCropModal(true)}
                className="bg-white border-2 border-dashed border-[#2D6A4F]/40 rounded-xl p-5 shadow-sm hover:border-[#2D6A4F] hover:bg-[#F1F7F3] transition-all flex flex-col items-center justify-center text-center min-h-[200px]"
              >
                <svg className="w-10 h-10 text-[#2D6A4F]/60 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-sm font-semibold text-[#2D6A4F]">Add New Crop Plot</span>
              </button>
            </div>
          </section>

          {/* AI Advisory Section */}
          <section className="bg-white border border-[#2D6A4F]/20 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1B4332]">AI Smart Advisory</h2>
                <p className="text-xs text-gray-500">Get personalized cultivation and action recommendations based on current sensor status.</p>
              </div>
              {(() => {
                const isGuest = user?.isAnonymous || profile?.is_guest;
                return (
                  <button
                    disabled={advisoryLoading || (isGuest && advisoryUsedByGuest)}
                    onClick={fetchAdvisory}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                      isGuest && advisoryUsedByGuest
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-[#2D6A4F] text-white hover:bg-[#1B4332] disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {isGuest && advisoryUsedByGuest ? "Login to use again" : "Get AI Advisory"}
                  </button>
                );
              })()}
            </div>

            <div className="bg-[#F1F7F3] border border-[#2D6A4F]/10 rounded-xl p-4">
              {advisoryLoading && (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-5 h-5 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600 font-medium animate-pulse">Generating your AI recommendations...</p>
                </div>
              )}
              
              {!advisoryLoading && advisoryText && (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {advisoryText}
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Live Sensor Panel */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1B4332]">Live Sensor Panel</h2>
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${!hasReceivedData ? "bg-amber-400" : isOffline ? "bg-gray-400" : "bg-emerald-400"} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${!hasReceivedData ? "bg-amber-500" : isOffline ? "bg-gray-500" : "bg-emerald-500"}`}></span>
                </span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${!hasReceivedData ? "bg-amber-100 text-amber-800" : isOffline ? "bg-gray-200 text-gray-700" : "bg-emerald-100 text-emerald-800"}`}>
                {!hasReceivedData ? "Waiting for sensor connection" : isOffline ? "Sensor offline" : "Live Feed Active"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {sensorCardsList.map((sensor, idx) => (
                <SensorCard
                  key={idx}
                  label={sensor.label}
                  value={sensor.value}
                  unit={sensor.unit}
                  isOffline={isOffline}
                />
              ))}
            </div>
          </section>

          {/* Section: Government Schemes */}
          <section>
            <h2 className="text-xl font-bold text-[#1B4332] mb-4">Government Schemes</h2>
            <div className="bg-[#F1F7F3] rounded-xl p-5 space-y-3">
              {[
                {
                  name: "PM-KISAN",
                  desc: "Income support of ₹6,000/year for small and marginal farmers.",
                  link: "https://pmkisan.gov.in"
                },
                {
                  name: "myScheme Portal",
                  desc: "Discover and apply for central & state government schemes.",
                  link: "https://www.myscheme.gov.in"
                },
                {
                  name: "Soil Health Card Scheme",
                  desc: "Free soil health cards with nutrient recommendations.",
                  link: "https://soilhealth.dac.gov.in"
                },
                {
                  name: "PMFBY Crop Insurance",
                  desc: "Affordable crop insurance against natural calamities.",
                  link: "https://pmfby.gov.in"
                }
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col bg-white rounded-lg p-3 border border-[#2D6A4F]/10 hover:border-[#2D6A4F]/40 transition-colors"
                >
                  <span className="text-sm font-semibold text-[#1B4332]">{s.name}</span>
                  <span className="text-xs text-gray-600">{s.desc}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Section 3: Placeholders */}
          <section>
            <h2 className="text-xl font-bold text-[#1B4332] mb-4">Upcoming Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Notifications Placeholder */}
              <div className="bg-[#F1F7F3] border-2 border-dashed border-[#2D6A4F]/30 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center h-32">
                <span className="text-xl mb-1">🔔</span>
                <span className="text-sm font-semibold text-[#1B4332]">Notifications</span>
                <span className="text-xs text-gray-500 mt-1">Coming Soon</span>
              </div>

              {/* Price Prediction Placeholder */}
              <div className="bg-[#F1F7F3] border-2 border-dashed border-[#2D6A4F]/30 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center h-32">
                <span className="text-xl mb-1">💰</span>
                <span className="text-sm font-semibold text-[#1B4332]">Price Prediction</span>
                <span className="text-xs text-gray-500 mt-1">Coming Soon</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showAddCropModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#1B4332]">Add New Crop Plot</h3>
            <button
              onClick={() => setShowAddCropModal(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleAddCrop} className="space-y-4">
            <div>
              <label htmlFor="plot_name" className="block text-sm font-medium text-gray-700 mb-1">
                Plot Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="plot_name"
                value={newCrop.plot_name}
                onChange={(e) => setNewCrop({ ...newCrop, plot_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent"
                placeholder="e.g., North Field - Plot 1"
                required
              />
            </div>

            <div>
              <label htmlFor="crop_type" className="block text-sm font-medium text-gray-700 mb-1">
                Crop Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="crop_type"
                value={newCrop.crop_type}
                onChange={(e) => setNewCrop({ ...newCrop, crop_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent"
                placeholder="e.g., Wheat, Rice, Mango"
                required
              />
            </div>

            <div>
              <label htmlFor="crop_category" className="block text-sm font-medium text-gray-700 mb-1">
                Crop Category
              </label>
              <select
                id="crop_category"
                value={newCrop.crop_category}
                onChange={(e) => setNewCrop({ ...newCrop, crop_category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent"
              >
                <option value="Seasonal">Seasonal</option>
                <option value="Plantation">Plantation</option>
              </select>
            </div>

            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="start_date"
                value={newCrop.start_date}
                onChange={(e) => setNewCrop({ ...newCrop, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                id="end_date"
                value={newCrop.end_date}
                onChange={(e) => setNewCrop({ ...newCrop, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddCropModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addCropLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#2D6A4F] text-white hover:bg-[#1B4332] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addCropLoading ? "Adding..." : "Add Crop"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);
}

