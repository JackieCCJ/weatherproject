import dotenv from "dotenv";
import fs from "fs"; 
dotenv.config();

const apiKey = process.env.WEATHER_API_KEY;

// Vancouver coordinates
const lat = 49.2827;
const lon = -123.1207;

// OpenWeather Forecast API (5 day / 3 hour)
const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

function simplifyForecast(apiResponse) {
  return apiResponse.list.map(item => ({
    time: item.dt_txt,                        // forecast time
    temp: item.main.temp,                     // temperature
    feels_like: item.main.feels_like,         // feels like
    weather: item.weather[0].main,            // e.g. "Clouds"
    description: item.weather[0].description  // e.g. "broken clouds"
  }));
}


async function getAndSaveWeather() {
  const response = await fetch(url);
  const data = await response.json();

  // simplify
  const simplified = simplifyForecast(data);

  // wrap with city info
  const output = {
    city: {
      id: data.city.id,
      name: data.city.name,
      country: data.city.country,
      coord: data.city.coord
    },
    forecast: simplified
  };


  // sanitize city name → remove spaces/special chars
  const safeCityName = data.city.name.replace(/\s+/g, "_");  
  const filename = `${safeCityName}_weather.json`;

  fs.writeFileSync(filename, JSON.stringify(output, null, 2));

  console.log(`✅ Saved forecast to ${filename}`);
}

getAndSaveWeather();



