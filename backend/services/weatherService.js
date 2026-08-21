import axios from "axios";

export async function getWeatherData({ state, district, latitude, longitude }) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === "your_openweather_api_key_here") {
    return {
      location: district || state || "Local Farm",
      temp_c: 30,
      humidity_pct: 65,
      description: "Partly Cloudy (Default)",
      forecast: "Light rain expected in 24 hours"
    };
  }

  let queryParam = "";
  if (latitude && longitude) {
    queryParam = `lat=${latitude}&lon=${longitude}`;
  } else if (district) {
    queryParam = `q=${encodeURIComponent(district)},IN`;
  } else if (state) {
    queryParam = `q=${encodeURIComponent(state)},IN`;
  } else {
    queryParam = `q=New Delhi,IN`;
  }

  try {
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?${queryParam}&appid=${apiKey}&units=metric`
    );

    const weatherData = weatherRes.data;

    let forecastText = "Clear sky";
    try {
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?${queryParam}&appid=${apiKey}&units=metric&cnt=8`
      );
      if (forecastRes.data?.list?.length > 0) {
        const nextCondition = forecastRes.data.list[3]?.weather[0]?.description || forecastRes.data.list[0]?.weather[0]?.description;
        const nextTemp = forecastRes.data.list[3]?.main?.temp || forecastRes.data.list[0]?.main?.temp;
        forecastText = `Next 24h: ${nextCondition}, ~${Math.round(nextTemp)}°C`;
      }
    } catch (e) {
      // Forecast sub-call optional
    }

    return {
      location: weatherData.name || district || state,
      temp_c: Math.round(weatherData.main.temp),
      humidity_pct: weatherData.main.humidity,
      description: weatherData.weather[0]?.description || "Clear",
      forecast: forecastText
    };
  } catch (err) {
    console.error("OpenWeatherMap API Error:", err.message);
    return {
      location: district || state || "Local Farm",
      temp_c: 28,
      humidity_pct: 60,
      description: "Sunny",
      forecast: "No immediate rainfall"
    };
  }
}
