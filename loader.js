import fs from "fs";
import readline from "readline";

function getTripAdvice(weather, description) {
  const w = weather.toLowerCase();

  if (w.includes("rain") || w.includes("snow") || w.includes("thunderstorm")) {
    return "🌧️ Maybe next time, or prepare for bad weather.";
  }

  if (w.includes("cloud")) {
    return `☁️ Cloudy but okay. Conditions: ${description}.`;
  }

  if (w.includes("clear")) {
    return "🌞 Great weather! Go for it!";
  }

  if (w.includes("mist") || w.includes("fog") || w.includes("haze")) {
    return "🌫️ Low visibility, take caution if traveling.";
  }

  // fallback
  return `🤔 Weather condition: ${weather} (${description}). Use your best judgment.`;
}


// read the file
const raw = fs.readFileSync("Vancouver_weather.json", "utf-8");

// parse JSON into an object
const weatherData = JSON.parse(raw);

// access city info
console.log("Forcasting", weatherData.city.name); // "Vancouver"

// access forecast array
//console.log(weatherData.forecast.length); // number of forecast entries
//console.log(weatherData.forecast[0]); // first forecast block
//console.log(weatherData.forecast[0].temp); // temperature of first block

/* Sample Output:
Vancouver
40
{
  time: '2025-09-24 21:00:00',
  temp: 19.05,
  feels_like: 18.92,
  weather: 'Clear',
  description: 'clear sky'
}
19.05

*/

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



rl.question("Enter forecast time (YYYY-MM-DD HH:MM:SS): ", (inputTime) => {
  const inputMs = new Date(inputTime).getTime();

  // convert forecast times into ms
  const forecasts = weatherData.forecast.map(f => ({
    ...f,
    ms: new Date(f.time).getTime()
  }));

  // check for exact match
  const exact = forecasts.find(f => f.ms === inputMs);
  if (exact) {
    console.log(`\n✅ Exact forecast at ${exact.time}:`);
    console.log(`Temp: ${exact.temp}°C (feels like ${exact.feels_like}°C)`);
    console.log(`Weather: ${exact.weather} (${exact.description})`);
    console.log(getTripAdvice(exact.weather, exact.description));    
    rl.close();
    return;
  }

  // find two surrounding forecasts
  let before = null, after = null;
  for (let i = 0; i < forecasts.length - 1; i++) {
    if (forecasts[i].ms < inputMs && inputMs < forecasts[i+1].ms) {
      before = forecasts[i];
      after = forecasts[i+1];
      break;
    }
  }

  if (before && after) {
    console.log(`\n⏳ No exact match. Input is between:`);
    [before, after].forEach(f => {
      console.log(`\nForecast at ${f.time}:`);
      console.log(`Temp: ${f.temp}°C (feels like ${f.feels_like}°C)`);
      console.log(`Weather: ${f.weather} (${f.description})`);
      console.log(getTripAdvice(f.weather, f.description));
    });
  } else {
    console.log("\n⚠️ Input time is out of forecast range.");
  }

  rl.close();
});