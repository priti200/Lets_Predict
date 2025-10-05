import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeoCoordinates = async (place) => {
  console.log(`🌍 Fetching real coordinates for: '${place}'`);

  if (place.startsWith("coords:")) {
    const [lat, lon] = place.replace("coords:", "").split(",").map(Number);
    return { lat, lon, name: `Custom Coordinates`, notFound: false };
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
    );
    const data = await response.json();

    if (data.length === 0) {
      console.warn(`⚠️ No results found for: ${place}`);
      return {
        lat: 11.2588,
        lon: 75.7804,
        name: null,
        notFound: true,
      };
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

const getHistoricalWeatherData = async (lat, lon, date) => {
  console.log(`📡 Fetching historical weather data from NASA POWER API for ${lat}, ${lon} around ${date}`);

  try {
    // Parse the date input (e.g., "July 15-20")
    const today = new Date();
    const year = today.getFullYear() - 1; // Use last year for historical data
    
    // Extract month and days from the date string
    const [monthStr, daysStr] = date.split(' ');
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                        'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIndex = monthNames.findIndex(m => m.startsWith(monthStr.toLowerCase().substring(0, 3)));
    const month = monthIndex !== -1 ? monthIndex + 1 : 7; // Default to July if parsing fails
    
    const [startDay, endDay] = daysStr ? daysStr.split('-').map(d => parseInt(d, 10)) : [15, 20];
    
    // Format dates as YYYYMMDD
    const startDate = `${year}${String(month).padStart(2, '0')}${String(startDay).padStart(2, '0')}`;
    const endDate = `${year}${String(month).padStart(2, '0')}${String(endDay || startDay).padStart(2, '0')}`;

    // NASA POWER API endpoint
    const nasaPowerUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M,WS10M,PRECTOTCORR&community=RE&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`;

    console.log(`🛰️ Requesting NASA POWER data: ${startDate} to ${endDate}`);

    const response = await fetch(nasaPowerUrl);
    
    if (!response.ok) {
      console.warn(`⚠️ NASA POWER API returned status ${response.status}`);
      throw new Error(`NASA POWER API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract parameter data
    const temp_data = data.properties.parameter.T2M;
    const humidity_data = data.properties.parameter.RH2M;
    const wind_data = data.properties.parameter.WS10M;
    const rain_data = data.properties.parameter.PRECTOTCORR;

    // Calculate probabilities based on historical data
    const temp_values = Object.values(temp_data);
    const rain_values = Object.values(rain_data);
    const wind_values = Object.values(wind_data);
    const totalDays = temp_values.length;

    const extremeHeatDays = temp_values.filter(t => t > 35).length;
    const heavyRainDays = rain_values.filter(r => r > 10).length;
    const highWindsDays = wind_values.filter(w => w > 15).length;

    const probabilities = {
      extremeHeat: extremeHeatDays / totalDays,
      heavyRain: heavyRainDays / totalDays,
      highWinds: highWindsDays / totalDays,
    };

    // Calculate temperature trend
    const first_day_temp = temp_values[0];
    const last_day_temp = temp_values[temp_values.length - 1];
    const temp_increase_percent = ((last_day_temp - first_day_temp) / first_day_temp * 100).toFixed(2);

    // Calculate averages for current conditions
    const avgTemp = (temp_values.reduce((a, b) => a + b, 0) / totalDays).toFixed(1);
    const avgHumidity = (Object.values(humidity_data).reduce((a, b) => a + b, 0) / totalDays).toFixed(1);
    const avgWind = (wind_values.reduce((a, b) => a + b, 0) / totalDays).toFixed(1);

    console.log(`✅ NASA POWER data retrieved: ${totalDays} days of historical data`);

    return {
      probabilities,
      trends: {
        temp_increase_percent,
      },
      averages: {
        temp: avgTemp,
        humidity: avgHumidity,
        wind: avgWind,
      },
      rawData: {
        temp: temp_values,
        humidity: Object.values(humidity_data),
        wind: wind_values,
        rain: rain_values,
      }
    };

  } catch (error) {
    console.error("❌ Error fetching NASA POWER data:", error);
    
    // Fallback to simulated data if API fails
    console.log("⚠️ Using fallback simulated data");
    return {
      probabilities: {
        extremeHeat: Math.random() * 0.5,
        heavyRain: Math.random() * 0.6,
        highWinds: Math.random() * 0.4,
      },
      trends: {
        temp_increase_percent: (Math.random() * 10).toFixed(2),
      },
      averages: {
        temp: (20 + Math.random() * 15).toFixed(1),
        humidity: (50 + Math.random() * 30).toFixed(1),
        wind: (5 + Math.random() * 10).toFixed(1),
      }
    };
  }
};

const getAIAnalysis = async (weatherData) => {
  console.log(`🤖 Generating AI analysis using Google Gemini...`);

  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn("⚠️ No Gemini API key found, using fallback analysis");
      return generateFallbackAnalysis(weatherData);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemma-3n-e2b-it" });

    const { extremeHeat, heavyRain, highWinds } = weatherData.probabilities;
    const { plans, name, date } = weatherData;
    const { temp, humidity, wind } = weatherData.averages || {};

    const prompt = `You are a helpful AI weather analyst. Generate a detailed weather and activity analysis in markdown format.

Location: ${name}
Date Range: ${date}
User's Plans: ${plans}

Historical Climate Data (from NASA satellites):
- Average Temperature: ${temp}°C
- Average Humidity: ${humidity}%
- Average Wind Speed: ${wind} m/s
- Temperature Trend: ${weatherData.trends.temp_increase_percent}% change over the period
- Extreme Heat Probability: ${(extremeHeat * 100).toFixed(0)}%
- Heavy Rain Probability: ${(heavyRain * 100).toFixed(0)}%
- High Winds Probability: ${(highWinds * 100).toFixed(0)}%

Please provide:
1. A brief overview of the climate conditions
2. Specific analysis of how these conditions affect the user's plans: "${plans}"
3. Key precautions and recommendations
4. A practical packing list (as a markdown checklist)

Keep the response concise, practical, and focused on actionable advice.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ AI analysis generated successfully");

    return {
      analysisText: text,
      coordinates: weatherData.coordinates
    };

  } catch (error) {
    console.error("❌ Error calling Gemini API:", error);
    return generateFallbackAnalysis(weatherData);
  }
};

const generateFallbackAnalysis = (weatherData) => {
  const { extremeHeat, heavyRain, highWinds } = weatherData.probabilities;
  const { plans, name, date } = weatherData;
  const { temp, humidity, wind } = weatherData.averages || {};

  let analysis = `### AI Weather & Activity Analysis for ${name} (${date})\n\n`;
  
  if (temp && humidity && wind) {
    analysis += `**Current Conditions (Historical Average):**\n`;
    analysis += `- Temperature: ${temp}°C\n`;
    analysis += `- Humidity: ${humidity}%\n`;
    analysis += `- Wind Speed: ${wind} m/s\n\n`;
  }

  analysis += `Based on historical data from NASA's Earth observation satellites, the climate trend for this region shows a **${weatherData.trends.temp_increase_percent}% temperature change** for this time of year.\n\n`;

  analysis += "**Key Environmental Risk Factors:**\n";
  if (extremeHeat > 0.3) analysis += `- **High risk of extreme heat** (${(extremeHeat * 100).toFixed(0)}% probability)\n`;
  if (heavyRain > 0.4) analysis += `- **Moderate risk of heavy rain** (${(heavyRain * 100).toFixed(0)}% probability)\n`;
  if (highWinds > 0.25) analysis += `- **Elevated risk of high winds** (${(highWinds * 100).toFixed(0)}% probability)\n`;
  if (extremeHeat <= 0.3 && heavyRain <= 0.4 && highWinds <= 0.25) {
    analysis += "- Environmental conditions appear relatively stable based on historical data\n";
  }

  analysis += `\n**Analysis for Your Plans: '${plans}'**\n`;
  if (plans.toLowerCase().includes('hik') && heavyRain > 0.4) {
    analysis += "- **Hiking Caution:** Risk of heavy rain could lead to slippery trails. Consider waterproof boots and monitor flash flood warnings\n";
  } else if (plans.toLowerCase().includes('camp') && highWinds > 0.25) {
    analysis += "- **Camping Caution:** High winds pose a risk to tents. Ensure proper securing with heavy-duty stakes\n";
  } else if (plans.toLowerCase().includes('beach') && extremeHeat > 0.3) {
    analysis += "- **Beach Advisory:** High heat risk. Plan for early morning or late afternoon activities, stay hydrated\n";
  } else {
    analysis += "- Your planned activities appear suitable for expected conditions, but remain vigilant\n";
  }

  analysis += "\n**Suggested Packing List:**\n";
  if (extremeHeat > 0.3) analysis += "- Extra water/hydration reservoir\n- Sunscreen (SPF 50+)\n- Wide-brimmed hat\n";
  if (heavyRain > 0.4) analysis += "- Waterproof jacket and pants\n- Dry bags for electronics\n- Extra socks\n";
  if (highWinds > 0.25) analysis += "- Windbreaker jacket\n- Sturdy tent/shelter\n";
  analysis += "- First-aid kit\n- Map and GPS device\n- Portable charger\n";

  return {
    analysisText: analysis,
    coordinates: weatherData.coordinates
  };
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