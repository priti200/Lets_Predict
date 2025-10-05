import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeoCoordinates = async (place) => {
  try {
    console.log(`AGENT ACTION: Geocoding the place: '${place}'. Attempting Mapbox forward geocoding using REACT_APP_MAPBOX_API_KEY from .env.`);
    const token = process.env.REACT_APP_MAPBOX_API_KEY;
    if (token && place && place.trim().length > 0) {
        try {
            const query = encodeURIComponent(place);
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data && data.features && data.features.length > 0) {
                    const feat = data.features[0];
                    const [lon, lat] = feat.center;
                    const name = feat.place_name;
                    console.log(`Mapbox geocode success: ${name} -> ${lat}, ${lon}`);
                    return { lat, lon, name };
                }
            } else {
                console.warn('Mapbox geocoding returned non-OK response', res.status);
            }
        } catch (err) {
            console.warn('Mapbox geocoding failed:', err.message || err);
        }
    } else {
        console.log('No Mapbox token found or empty place; falling back to local mock behavior.');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    if (place && place.toLowerCase().includes('yosemite')) {
        return { lat: 37.8651, lon: -119.5383, name: 'Yosemite National Park' };
    }

    return {
        lat: 11.2588,
        lon: 75.7804,
        name: "Calicut, India",
        notFound: true,
    };

  } catch (error) {
    console.error("❌ Geocoding error:", error);
    return {
      lat: 11.2588,
      lon: 75.7804,
      name: null,
      notFound: true,
    };
  }
};

const getWeatherData = async (lat, lon, date) => {
    console.log(`AGENT ACTION: Fetching historical and real-time weather data from NASA and OpenWeatherMap APIs for ${lat}, ${lon} around ${date}.`);

    const openWeatherApiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
    const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
    let realTimeWeather = {};
    try {
        const res = await fetch(openWeatherUrl);
        if (res.ok) {
            const data = await res.json();
            realTimeWeather = {
                temp: data.main.temp,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                description: data.weather[0].description,
            };
            console.log("✅ Real-time weather data fetched successfully.");
        } else {
            console.warn("OpenWeatherMap API returned non-OK response", res.status);
        }
    } catch (error) {
        console.error("Error fetching real-time weather data:", error);
    }

    const nasaApiKey = process.env.REACT_APP_EARTHDATA_TOKEN;
    const today = new Date();
    const year = today.getFullYear() - 1;
    const [month, days] = date.split(' ');
    const [startDay, endDay] = days.split('-').map(d => parseInt(d, 10));
    const startDate = `${year}${String(new Date(Date.parse(month +" 1, 2012")).getMonth() + 1).padStart(2, '0')}${String(startDay).padStart(2, '0')}`;
    const endDate = `${year}${String(new Date(Date.parse(month +" 1, 2012")).getMonth() + 1).padStart(2, '0')}${String(endDay).padStart(2, '0')}`;

    const nasaPowerUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M,WS10M,PRECTOTCORR&community=RE&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON&api_key=${nasaApiKey}`;

    let historicalData = {
        probabilities: {
            extremeHeat: 0,
            heavyRain: 0,
            highWinds: 0,
        },
        trends: {
            temp_increase_percent: 0,
        }
    };

    try {
        const res = await fetch(nasaPowerUrl);
        if (res.ok) {
            const data = await res.json();
            const temp_data = data.properties.parameter.T2M;
            const humidity_data = data.properties.parameter.RH2M;
            const wind_data = data.properties.parameter.WS10M;
            const rain_data = data.properties.parameter.PRECTOTCORR;

            const extremeHeatDays = Object.values(temp_data).filter(t => t > 35).length;
            const heavyRainDays = Object.values(rain_data).filter(r => r > 10).length;
            const highWindsDays = Object.values(wind_data).filter(w => w > 15).length;
            const totalDays = Object.values(temp_data).length;

            historicalData.probabilities.extremeHeat = extremeHeatDays / totalDays;
            historicalData.probabilities.heavyRain = heavyRainDays / totalDays;
            historicalData.probabilities.highWinds = highWindsDays / totalDays;

            const first_day_temp = Object.values(temp_data)[0];
            const last_day_temp = Object.values(temp_data)[totalDays - 1];
            historicalData.trends.temp_increase_percent = ((last_day_temp - first_day_temp) / first_day_temp * 100).toFixed(2);

            historicalData.temp = Object.values(temp_data);
            historicalData.humidity = Object.values(humidity_data);
            historicalData.wind = Object.values(wind_data);

            console.log("✅ Historical weather data fetched and processed successfully.");
        } else {
            console.warn("NASA POWER API returned non-OK response", res.status);
        }
    } catch (error) {
        console.error("Error fetching historical weather data:", error);
    }

    return {
        ...historicalData,
        realTime: realTimeWeather,
    };
};

const getAIAnalysis = async (weatherData) => {
    console.log(`AGENT ACTION: Synthesizing data and generating a human-readable response using a generative AI model.`);
    
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

    const { heavyRain } = weatherData.probabilities;
    const { plans } = weatherData;
    const { temp, windSpeed } = weatherData.realTime;

    const prompt = `You are a helpful AI assistant that provides brief, actionable weather analysis.

Generate a CONCISE response in Markdown format for ${weatherData.name} on ${weatherData.date}.

**Format your response exactly like this:**

### Weather Snapshot
**Temperature:** ${temp}°C → [Pick ONE: Too Cold / Cold / Mild / Warm / Hot / Too Hot]

**Wind:** ${windSpeed} m/s → [Pick ONE: Calm / Mild Breeze / Windy / Too Windy]

**Rain:** ${(heavyRain * 100).toFixed(0)}% chance → [Pick ONE: Dry / Light Rain / Heavy Rain / Stormy]

### Quick Take for "${plans}"
Write ONE brief paragraph (2-3 sentences) about:
- Whether conditions are good/challenging for these plans
- Main safety concern if any (mention this only if there's a real risk)

Keep the entire response under 100 words. Be direct and practical.`;

    console.log("Prompt:", prompt);

    try {
        const model = genAI.getGenerativeModel({ model: "gemma-3n-e2b-it"});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Response text:", text);

        return { 
            analysisText: text, 
            coordinates: weatherData.coordinates, 
            weatherData: weatherData 
        };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return {
            analysisText: "Error generating AI analysis.",
            coordinates: weatherData.coordinates,
            weatherData: weatherData
        };
    }
};

export const getWeatherAnalysis = async (place, date, plans) => {
  const placeInfo = await getGeoCoordinates(place);

  if (placeInfo.notFound) {
    return {
      analysisText: `⚠️ Could not find the location **"${place}"** in global datasets. Showing fallback location (Calicut, India) on the map.\n\nPlease try a different name or include more details (e.g., "Paris, France" instead of "Paris").`,
      coordinates: { lat: placeInfo.lat, lon: placeInfo.lon },
    };
  }

  const weatherData = await getWeatherData(placeInfo.lat, placeInfo.lon, date);

  const comprehensiveData = {
    ...weatherData,
    name: placeInfo.name,
    date: date,
    plans: plans,
    coordinates: { lat: placeInfo.lat, lon: placeInfo.lon },
  };

  const result = await getAIAnalysis(comprehensiveData);
  return result;
};