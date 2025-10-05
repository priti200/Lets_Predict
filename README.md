# GeoClima AI — Historical Weather Probability Planner

GeoClima AI helps outdoor planners and event organizers make data-driven decisions by answering: "What is the probability of adverse weather (very hot, very cold, very wet, very windy, or very uncomfortable) at this place and time of year?"

The app combines geocoding, historical Earth observation data, and explainable statistical scoring to produce concise probabilities, visualization-ready statistics, and downloadable data products. It was built as a focused, extensible hackathon MVP designed to be demonstrable and reproducible.

Key ideas that guided the design:
- Make queries personal: allow users to choose a point or name a place and specify a date or calendar-day range.
- Be explainable: compute empirical probabilities from historical data (percentiles, counts, trends) rather than returning opaque model outputs.
- Keep results shareable and reproducible: every output includes basic metadata (variable units, source link, query bounding info) and can be exported as CSV/JSON.

## Live demo / Pitch

For a quick demo, open the app in your browser, enter a place (e.g., "Yosemite National Park"), pick a date range (e.g., "Aug 10-12"), and submit. The app will:

- Resolve the place to coordinates and center the map.
- Fetch historical observations for the selected calendar days and compute event probabilities (e.g., P(max temp &gt; 90°F)).
- Return a short action-oriented summary, numeric probabilities for the chosen variables, and downloadable CSV/JSON containing the raw subset and metadata.

This workflow supports quick, defensible decisions (e.g., "65% chance of very hot conditions — bring extra water and shade").

## Features (MVP)

- Place input: typed or voice-entered place, resolved with Mapbox forward geocoding.
- Map: fly-to resolved coordinates and show a pin; map supports future pin-drop/polygon selection.
- Data pipeline: modular `weatherService` that will fetch historical daily data and compute empirical statistics and probabilities.
- Analysis: human-readable summary with numeric probabilities for core event types (heat, cold, precipitation, wind, combined discomfort).
- Exports: CSV and JSON export of the subset, metadata, and computed metrics (ready for further analysis).

## Data provenance

Planned and supported data sources:

- NASA POWER (POWER Data Access Viewer) — global climatology and solar/meteorological variables.
- NASA Giovanni / GES DISC — gridded satellite reanalysis (MERRA-2, GPM) for richer variables and region-averaged queries.
- Open‑Meteo — quick, no-key historical daily/hourly data suitable for fast prototyping.

Every exported data product contains the source name, variable units, and the query parameters used so results are reproducible and auditable.

## Tech stack

- Frontend: React (Create React App), React Bootstrap for UI components
- Mapping: Mapbox (via `react-map-gl`) for geocoding and base maps
- Charting: Chart.js / `react-chartjs-2` for probability distributions and time series
- Data layer: `src/services/weatherService.js` (modular service for geocoding, historical retrieval, scoring)

Note: for hackathon delivery we prioritized a client-first architecture to allow quick demos. If server-side auth or heavy processing is required, the `weatherService` module is easy to extract into a lightweight Node/Flask proxy service.

## Installation (for judges & reviewers)

1. Clone the repository and install dependencies:

```powershell
git clone https://github.com/priti200/Lets_Predict.git
cd Lets_Predict
npm install
```

2. Add your Mapbox token (public) to a `.env` file in the project root:

```properties
REACT_APP_MAPBOX_API_KEY=pk.YOUR_MAPBOX_TOKEN
```

3. Run the app locally:

```powershell
npm start
```

Open http://localhost:3000 in your browser.

## How the scoring works (brief)

1. For the requested location (point or area) and calendar day(s), fetch historical daily values for the last N years.
2. For each variable (temperature, precipitation, wind), compute a distribution of historical values for those calendar days.
3. Define event thresholds (configurable): e.g., very hot &gt; 90°F or &gt; 90th percentile for that day.
4. Probability = fraction of historical samples exceeding the threshold. Also compute basic trends (recent decade vs baseline).

This method is transparent, reproducible, and well-suited for communicating risk to non-experts.

## Roadmap & next steps

- Integrate NASA Giovanni and POWER APIs for richer climate products and area-averaging.
- Add interactive map tools: click-to-pin, polygon drawing for area averages, and multi-point event planners.
- Add downloadable visualizations and automated report generation (PDF).
- Harden with server-side caching/proxy for large query workloads and to support NASA Earthdata authenticated services.

## Team & credits

Team GeoClima — Hackathon entry

- Lead dev: Priti
- UX & testing: Saketh
- Data engineer: Jyoth

This project was built for the NASA Earth Observation challenge and uses openly licensed NASA data products and Mapbox for map display. See the `src/services/weatherService.js` file for pointers to the data integration code and links to the NASA data portals.

## License

MIT

---

If you'd like a short project one-pager (single-slide summary) or a tailored demo script for the hackathon judges, I can generate one next.
