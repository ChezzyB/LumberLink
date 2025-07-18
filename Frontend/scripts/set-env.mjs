import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const appJsonPath = path.resolve('./app.json');

// Load and parse app.json
const appJsonRaw = fs.readFileSync(appJsonPath, 'utf8');
const appJson = JSON.parse(appJsonRaw);

// Extract environment variables from .env
const apiBaseUrl = process.env.API_BASE_URL;


if (!apiBaseUrl) {
  console.error("API_BASE_URL not found in your .env file.");
  process.exit(1);
}

// Ensure the 'extra' object exists
if (!appJson.expo.extra) {
  appJson.expo.extra = {};
}

// Inject environment variables
appJson.expo.extra.apiBaseUrl = apiBaseUrl;

// Write the updated app.json
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log("Environment variables injected into app.json");
console.log("- apiBaseUrl:", apiBaseUrl ? "Loaded" : "Not Loaded");
