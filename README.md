
# Did Diwali Change the Air? PM2.5 Across Five Cities in India

An interactive data analysis exploring how PM2.5 concentrations changed around Diwali 2026 across **Solapur, Pune, Mumbai, Hyderabad and Delhi**.

Using hourly modelled air-quality estimates, this project compares pollution patterns before, during and after Diwali (Lakshmi Puja: 8 November 2026) through interactive visualisations and statistical summaries.

**[View Live Demo](https://diwali-aqi-git-main-mayurij0306-1498s-projects.vercel.app/)**

---

## Overview

Diwali celebrations often bring attention to air pollution, particularly the impact of fireworks on particulate matter.

This project explores pollution patterns around Diwali by analysing hourly PM2.5 estimates across five Indian cities.

It investigates three key questions:

- How did PM2.5 concentrations change around Diwali in each city?
- Which city recorded the highest estimated PM2.5 peak?
- How did pollution levels compare with the selected baseline period?

The goal is to make air-quality data easier to explore, understand and compare.

## Cities Covered

- Solapur
- Pune
- Mumbai
- Hyderabad
- Delhi

## Key Features

- **Hourly PM2.5 Analysis:** Explore pollution patterns across five cities.
- **Before-and-After Comparison:** Compare baseline and Diwali-period pollution levels.
- **Peak Concentration:** Identify the highest estimated PM2.5 concentration in each city.
- **Threshold Analysis:** Calculate hours with PM2.5 concentrations above 60 µg/m³.
- **Weather Context:** Include wind information to help interpret pollution patterns.
- **Interactive Visualisations:** Explore three figures and a comparative data table.
- **CSV Export:** Download the underlying data for further analysis.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Data Visualisation | Chart.js |
| Backend | Vercel Serverless Functions |
| Data Sources | Open-Meteo Air Quality API, Forecast API |
| Deployment | Vercel |

## How It Works

The application follows a client-server architecture:

1. **Data Retrieval:** The frontend sends a request to the `/api/data` endpoint.
2. **API Processing:** A Vercel serverless function fetches air-quality and forecast data from Open-Meteo for each city.
3. **Statistical Analysis:** The backend calculates baseline mean, analysis-window mean, percentage change, peak PM2.5, hours above 60 µg/m³ and wind statistics.
4. **Caching:** Vercel caches API responses for one hour to reduce repeated external API requests.
5. **Visualisation:** The frontend uses Chart.js to render interactive charts and a comparison table.
6. **Data Export:** Users can download the processed data in CSV format.

## Project Structure

```text
.
├── api/
│   └── data.js       # Serverless API and data processing
├── index.html        # Frontend structure
├── styles.css        # Styling and layout
├── app.js            # API calls, charts and CSV export
└── LEARN.md          # Notes on underlying concepts
```

## Run Locally

### Prerequisites

- Node.js
- npm

### Setup

Clone the repository:

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

Install the Vercel CLI:

```bash
npm install -g vercel
```

Start the local development server:

```bash
vercel dev
```

Open the application at:

```text
http://localhost:3000
```

**Note:** Opening `index.html` directly in a browser will not work because the application depends on the `/api/data` serverless endpoint.

## Deployment

The application is deployed using Vercel.

To deploy your own instance:

1. Push the project to a GitHub repository.
2. Import the repository into Vercel.
3. Deploy using the default settings.

No additional build configuration is required for the current project structure.

## Methodology & Limitations

A few considerations are important when interpreting the results:

- **Modelled Estimates:** PM2.5 values are modelled estimates obtained through Open-Meteo, not direct readings from ground-based monitoring stations.
- **No Causal Attribution:** An increase in PM2.5 around Diwali may be consistent with the effects of fireworks, but it does not establish fireworks as the sole cause.
- **Weather Influence:** Wind, humidity and temperature can influence particulate concentrations and their dispersion.
- **Baseline Dependency:** Percentage changes depend on the selected baseline period. Different date ranges may produce different comparisons.
- **Threshold Interpretation:** The 60 µg/m³ threshold is an analytical reference used in this project.

The results should therefore be interpreted as an exploratory comparison of modelled pollution patterns rather than a causal assessment of Diwali's contribution to air pollution.

## Future Improvements

- Integrate ground-monitoring data from CPCB or OpenAQ.
- Compare pollution patterns across multiple years of Diwali celebrations.
- Incorporate weather variables into a statistical adjustment model.
- Store dated API response snapshots to improve reproducibility.
- Expand the analysis to additional Indian cities.

## Data Sources & Attribution

Air-quality and forecast data are obtained from the [Open-Meteo APIs](https://open-meteo.com/).

Data attribution: Open-Meteo, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

**Built as an independent data-analysis project exploring air-quality patterns around Diwali 2026.**
