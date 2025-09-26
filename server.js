// server.js
import 'dotenv/config';
import express from 'express';

// if Node <18: import fetch from 'node-fetch';
const app = express();

const apiKey = process.env.WEATHER_API_KEY;

app.get('/api/check', async (req, res) => {
  try {
    const { lat, lon, datetime } = req.query;
    if (!lat || !lon || !datetime) {
      return res.status(400).json({ error: 'lat, lon, datetime required' });
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const r = await fetch(url);
    const data = await r.json();

    // Simplify
    const forecasts = data.list.map(item => ({
      time: item.dt_txt,
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      weather: item.weather[0].main,
      description: item.weather[0].description,
      ms: new Date(item.dt_txt).getTime()
    }));

    // Fuzzy match to closest 3-hour block
    const inputMs = new Date(datetime).getTime();
    let closest = forecasts[0];
    let diff = Math.abs(forecasts[0].ms - inputMs);
    for (const f of forecasts) {
      const d = Math.abs(f.ms - inputMs);
      if (d < diff) { closest = f; diff = d; }
    }

    // Classify → advice
    const syndrome = getTripSyndrome(closest.weather, closest.description);
    const advice = renderAdvice(syndrome, closest.description);

    res.json({
      city: data.city?.name,
      chosen: datetime,
      matched_time: closest.time,
      temp: closest.temp,
      feels_like: closest.feels_like,
      weather: closest.weather,
      description: closest.description,
      syndrome,
      advice
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to check weather' });
  }
});

function getTripSyndrome(weather, description) {
  const w = weather.toLowerCase();
  if (w.includes('rain') || w.includes('snow') || w.includes('thunderstorm')) return 'bad';
  if (w.includes('cloud')) return 'cloudy';
  if (w.includes('clear')) return 'clear';
  if (w.includes('mist') || w.includes('fog') || w.includes('haze')) return 'foggy';
  return 'unknown';
}

function renderAdvice(syndrome, description) {
  switch (syndrome) {
    case 'bad': return '🌧️ Maybe next time, or prepare for bad weather.';
    case 'cloudy': return `☁️ Cloudy but okay. Conditions: ${description}.`;
    case 'clear': return '🌞 Great weather! Go for it!';
    case 'foggy': return '🌫️ Low visibility, take caution if traveling.';
    default: return `🤔 Weather uncertain. Conditions: ${description}.`;
  }
}

app.listen(5000, () => console.log('API running on http://localhost:5000'));
