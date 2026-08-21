import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/advisory', async (req, res) => {
  try {
    const { sensor_data, crop_type, soil_type, language, state, district } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    let weatherSummary = '';
    try {
      const location = [district, state].filter(Boolean).join(',');
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${process.env.WEATHER_API_KEY}`;
      const response = await fetch(url);
      const weather = await response.json();
      weatherSummary = ` Current weather: ${weather.main.temp}°C, ${weather.weather[0].description}.`;
    } catch (e) {}

    const prompt = `Provide a ~100 word plain-language agricultural advisory in ${language} for ${crop_type} grown in ${soil_type} soil based on this sensor data: ${JSON.stringify(sensor_data)}.${weatherSummary}`;

    const result = await model.generateContent(prompt);
    res.json({ advisory_text: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/disease-detect', async (req, res) => {
  try {
    const { image, crop_type = 'crop', language = 'English' } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const imageData = image.split(',')[1] || image;
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg'
      }
    };

    const prompt = `Identify any visible pest, disease, or nutrient deficiency signs in this photo of ${crop_type}. Respond in ${language}.`;

    const result = await model.generateContent([prompt, imagePart]);
    res.json({ analysis_text: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alias for frontend compatibility
app.post('/api/disease-detection', async (req, res) => {
  try {
    const { image, crop_type = 'crop', language = 'English' } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const imageData = image.split(',')[1] || image;
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg'
      }
    };

    const prompt = `Identify any visible pest, disease, or nutrient deficiency signs in this photo of ${crop_type}. Respond in ${language}.`;

    const result = await model.generateContent([prompt, imagePart]);
    res.json({ analysis_text: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context, language } = req.body;
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: `You are a helpful farm assistant. Here is the farmer's current context: ${JSON.stringify(context)}. Please reply in ${language}.`
    });

    const result = await model.generateContent(message);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

