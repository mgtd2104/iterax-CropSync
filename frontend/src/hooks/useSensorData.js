import { useState, useEffect } from "react";
import { rtdb } from "../services/firebase";
import { ref, onValue } from "firebase/database";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function useSensorData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const sensorRef = ref(rtdb, "devices/esp32_unit_1/sensors");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          setData(val);

          const timestamp = typeof val.timestamp === "number"
            ? val.timestamp
            : new Date(val.timestamp || 0).getTime();

          const isExpired = !timestamp || Date.now() - timestamp > FIVE_MINUTES_MS;
          setIsOffline(isExpired);
        } else {
          setData(null);
          setIsOffline(true);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Sensor listener error:", error);
        setIsOffline(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, isOffline };
}


  return {
    sensors,
    alerts,
    commands,
    loading,
    error,
    isOffline,
    togglePumpOverride
  };
}
