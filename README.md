# Did Diwali change the air? PM2.5 in five Indian cities

A short data note comparing modelled hourly PM2.5 in Solapur, Pune, Mumbai, Hyderabad and Delhi around Diwali 2026 (Lakshmi Puja: 8 November), with method, limitations and references.

**Live demo:** _add your Vercel link_ · **Screenshot:** _add one here_

## Structure
```
api/data.js    Backend: Vercel serverless function (GET /api/data)
index.html     Frontend page
styles.css     Styling
app.js         Frontend logic: fetches /api/data, draws charts with Chart.js
LEARN.md       Notes on the concepts behind the project
```

## How the data flows
1. The browser requests `/api/data`.
2. `api/data.js` calls the free Open-Meteo Air Quality and Forecast APIs for each city, computes the statistics (baseline mean, window mean, change, peak, hours above 60 µg/m³, wind) and returns JSON.
3. Vercel caches the response for an hour, so visitors don't hit Open-Meteo each time.
4. `app.js` draws Figures 1-3 and Table 1 and offers a CSV download.

Cities, dates and thresholds are constants at the top of `api/data.js`.

## Run locally
```bash
npm i -g vercel      # once
vercel dev           # serves the page and /api/data at http://localhost:3000
```
(Opening `index.html` directly will not work, because `/api/data` needs the server.)

## Deploy
Push this folder to GitHub, import the repo in Vercel and click Deploy. No build settings are needed.

## Limitations
- Values are modelled estimates, not ground-sensor readings.
- Wind, humidity and temperature also affect November pollution, so a rise during Diwali is consistent with fireworks but does not prove they were the only cause.
- The baseline period is a choice; changing it changes the percentages.

## Ideas to extend
Add ground-station data (CPCB/OpenAQ), repeat for earlier Diwali dates, adjust for weather statistically, or store a dated snapshot of the data in the repo so results are reproducible.

Data: Open-Meteo (CC BY 4.0).
