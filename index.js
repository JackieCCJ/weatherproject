import dotenv from "dotenv";
import fs from "fs"; 
dotenv.config();

const apiKey = process.env.WEATHER_API_KEY;

// Vancouver coordinates
const lat = 49.2827;
const lon = -123.1207;

// OpenWeather Forecast API (5 day / 3 hour)
const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

async function getWeather() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    //console.log("Weather data for Vancouver:");
    //console.log(JSON.stringify(data, null, 2)); // pretty print
    console.log("Weather data for Vancouver fetched. Saving to weather.json...");
    //saving to local file
    fs.writeFileSync("weather.json", JSON.stringify(data, null, 2));
    console.log("✅ Saved to weather.json");

  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

getWeather();