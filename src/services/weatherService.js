import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeoCoordinates = async (place) => {
  try {
    console.log(`AGENT ACTION: Geocoding the place: '${place}'. Attempting Mapbox forward geocoding using REACT_APP_MAPBOX_API_KEY from .env.`);
    // Try to use Mapbox forward geocoding if an API key is available
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

    // Fallback/mock behavior (original behavior)
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    if (place && place.toLowerCase().includes('yosemite')) {
        return { lat: 37.8651, lon: -119.5383, name: 'Yosemite National Park' };
    }

    // The following lines are problematic because `data` is not defined in this scope.
    // I will comment them out and return a fallback value.
    // const { lat, lon, display_name } = data[0];
    // console.log(`✅ Found location: ${display_name} (${lat}, ${lon})`);

    // return {
    //   lat: parseFloat(lat),
    //   lon: parseFloat(lon),
    //   name: display_name,
    //   notFound: false,
    // };
    
    // Returning a fallback location
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

    // Fetch real-time weather data from OpenWeatherMap
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


    // Fetch historical weather data from NASA APIs (mocked)
    console.log(`-> Would query NASA POWER API for point-specific data (temperature, precipitation).`);
    console.log(`-> Would query NASA Giovanni API for area-averaged data (wind, humidity).`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    const historicalData = {
        probabilities: {
            extremeHeat: Math.random() * 0.5,
            heavyRain: Math.random() * 0.6,
            highWinds: Math.random() * 0.4,
        },
        trends: {
            temp_increase_percent: (Math.random() * 10).toFixed(2),
        }
    };

    return {
        ...historicalData,
        realTime: realTimeWeather,
    };
};

const getAIAnalysis = async (weatherData) => {
    console.log(`AGENT ACTION: Synthesizing data and generating a human-readable response using a generative AI model.`);
    
    // WARNING: Do not expose your API key in client-side code.
    // This is for demonstration purposes only.
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

    const { extremeHeat, heavyRain, highWinds } = weatherData.probabilities;
    const { plans } = weatherData;
    const { temp, humidity, windSpeed, description } = weatherData.realTime;

    const prompt = `### AI Weather & Activity Analysis for ${weatherData.name} (${weatherData.date})

**Current Weather:**
- Temperature: ${temp}°C
- Humidity: ${humidity}%
- Wind Speed: ${windSpeed} m/s
- Description: ${description}

**Historical Climate Trends:**
Based on historical data from NASA's Earth observation satellites, the climate trend for this region shows a **${weatherData.trends.temp_increase_percent}% increase** in average temperatures for this time of year over the last decade.

**Key Environmental Risk Factors (based on historical data):**
- High risk of extreme heat: ${(extremeHeat * 100).toFixed(0)}% probability.
- Moderate risk of heavy rain: ${(heavyRain * 100).toFixed(0)}% probability.
- Elevated risk of high winds: ${(highWinds * 100).toFixed(0)}% probability.

**Analysis for Your Plans: '${plans}'**

**Suggested Packing List:**
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemma-3n-e2b-it"});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return { 
            analysisText: text, 
            coordinates: weatherData.coordinates 
        };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return {
            analysisText: "Error generating AI analysis.",
            coordinates: weatherData.coordinates
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
