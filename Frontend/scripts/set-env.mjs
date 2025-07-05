import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const appJsonPath = path.resolve('./app.json');

// Load and parse app.json
const appJsonRaw = fs.readFileSync(appJsonPath, 'utf8');
const appJson = JSON.parse(appJsonRaw);

// Extract API key from .env
const weatherApiKey = process.env.WEATHER_API_KEY;

if (!weatherApiKey) {
  console.error("WEATHER_API_KEY not found in your .env file.");
  process.exit(1);
}

// Ensure the 'extra' object exists
if (!appJson.expo.extra) {
  appJson.expo.extra = {};
}

// Inject weatherApiKey
appJson.expo.extra.weatherApiKey = weatherApiKey;

// Write the updated app.json
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log("weatherApiKey injected into app.json");
