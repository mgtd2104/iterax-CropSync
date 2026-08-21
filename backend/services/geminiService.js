import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAdvisory({ sensor_data, crop_type, soil_type, land_area, language, weather_data }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return {
      advisory_text: `[Fallback Advisory] Soil moisture is at ${sensor_data?.moisture_pct || 0}%. Ensure appropriate irrigation for your ${crop_type || "crop"}. Weather: ${weather_data?.description || "Clear"}.`,
      severity_flag: (sensor_data?.moisture_pct < 30 || sensor_data?.tank_level_pct < 20) ? "warning" : "normal"
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are AgriSense, an expert AI farm advisor.
Analyze the following farm sensor & context data and provide actionable advice to the farmer.

Context Data:
- Language: ${language || "English"}
- Crop Type: ${crop_type || "General Crop"}
- Soil Type: ${soil_type || "Alluvial"}
- Land Area: ${land_area || "1"} acres
- Soil Moisture: ${sensor_data?.moisture_pct ?? "N/A"}%
- Air Temp: ${sensor_data?.air_temp_c ?? "N/A"}°C
- Humidity: ${sensor_data?.humidity_pct ?? "N/A"}%
- Tank Level: ${sensor_data?.tank_level_pct ?? "N/A"}%
- Rain Detected: ${sensor_data?.rain_detected ? "Yes" : "No"}
- Current Weather: ${weather_data?.description || "N/A"}, ${weather_data?.temp_c || "N/A"}°C
- Forecast: ${weather_data?.forecast || "N/A"}

Instructions:
1. Respond STRICTLY in the requested language: "${language || "English"}".
2. Keep the response UNDER 100 WORDS total. Use simple, plain, encouraging language with no technical jargon.
3. Determine a severity_flag from one of: ["normal", "warning", "critical"].
   - "critical": if soil moisture < 20% or water tank < 15%
   - "warning": if soil moisture < 35% or high heat > 38°C
   - "normal": otherwise
4. Return your output strictly as a JSON object with this exact structure:
{"advisory_text": "your advice here", "severity_flag": "normal|warning|critical"}
`;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    
    // Clean code blocks if returned
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    return {
      advisory_text: parsed.advisory_text || rawText,
      severity_flag: parsed.severity_flag || "normal"
    };
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    
    // Try fallback model if model name issue
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await fallbackModel.generateContent(prompt);
      const rawText = result.response.text();
      const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      return {
        advisory_text: parsed.advisory_text || rawText,
        severity_flag: parsed.severity_flag || "normal"
      };
    } catch (fallbackErr) {
      console.error("Gemini Fallback Error:", fallbackErr.message);
      return {
        advisory_text: `Soil moisture is ${sensor_data?.moisture_pct}%. Keep monitoring your ${crop_type} regularly and irrigate if soil gets dry.`,
        severity_flag: "normal"
      };
    }
  }
}
