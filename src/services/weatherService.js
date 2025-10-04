const getGeoCoordinates = async (place) => {
    console.log(`AGENT ACTION: Geocoding the place: '${place}'. In a real app, this would call an API like Nominatim.`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    if (place.toLowerCase().includes('yosemite')) {
        return { lat: 37.8651, lon: -119.5383, name: 'Yosemite National Park' };
    }
    return { lat: 11.2588, lon: 75.7804, name: 'Calicut, India' }; // Default
};

const getHistoricalWeatherData = async (lat, lon, date) => {
    console.log(`AGENT ACTION: Fetching historical weather data from NASA APIs for ${lat}, ${lon} around ${date}.`);
    console.log(`-> Would query NASA POWER API for point-specific data (temperature, precipitation).`);
    console.log(`-> Would query NASA Giovanni API for area-averaged data (wind, humidity).`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    return {
        probabilities: {
            extremeHeat: Math.random() * 0.5, 
            heavyRain: Math.random() * 0.6, 
            highWinds: Math.random() * 0.4, 
        },
        trends: {
            temp_increase_percent: (Math.random() * 10).toFixed(2),
        }
    };
};

const getAIAnalysis = async (weatherData) => {
    console.log(`AGENT ACTION: Synthesizing data and generating a human-readable response using a generative AI model.`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing time

    const { extremeHeat, heavyRain, highWinds } = weatherData.probabilities;
    const { plans } = weatherData;

    let analysis = `### AI Weather & Activity Analysis for ${weatherData.name} (${weatherData.date})\n\n`;
    analysis += `Based on historical data from NASA's Earth observation satellites, the climate trend for this region shows a **${weatherData.trends.temp_increase_percent}% increase** in average temperatures for this time of year over the last decade.\n\n`;

    analysis += "**Key Environmental Risk Factors:**\n";
    if (extremeHeat > 0.3) analysis += `- **High risk of extreme heat** (${(extremeHeat * 100).toFixed(0)}% probability).\n`;
    if (heavyRain > 0.4) analysis += `- **Moderate risk of heavy rain** (${(heavyRain * 100).toFixed(0)}% probability).\n`;
    if (highWinds > 0.25) analysis += `- **Elevated risk of high winds** (${(highWinds * 100).toFixed(0)}% probability).\n`;
    if (extremeHeat <= 0.3 && heavyRain <= 0.4 && highWinds <= 0.25) analysis += "- Environmental conditions appear relatively stable based on historical data.\n";

    analysis += `\n**Analysis for Your Plans: '${plans}'**\n`;
    if (plans.toLowerCase().includes('hike') && heavyRain > 0.4) {
        analysis += "- **Hiking Caution:** The risk of heavy rain could lead to slippery and dangerous trails. Consider waterproof hiking boots and be aware of flash flood warnings.\n";
    } else if (plans.toLowerCase().includes('camp') && highWinds > 0.25) {
        analysis += "- **Camping Caution:** High winds can pose a risk to tents. Ensure your tent is properly secured with heavy-duty stakes. Avoid camping near trees that could lose branches.\n";
    } else {
        analysis += "- Your planned activities seem appropriate for the expected conditions, but always remain vigilant.\n";
    }

    analysis += "\n**Suggested Packing List:**\n";
    if (extremeHeat > 0.3) analysis += "- Extra water / hydration reservoir, sunscreen, wide-brimmed hat.\n";
    if (heavyRain > 0.4) analysis += "- Full waterproof gear (jacket, pants), dry bags for electronics.\n";
    if (highWinds > 0.25) analysis += "- Windbreaker jacket, sturdy shelter or tent.\n";
    analysis += "- Standard first-aid kit, map and compass/GPS, portable charger.\n";

    return { 
        analysisText: analysis, 
        coordinates: weatherData.coordinates 
    };
};

export const getWeatherAnalysis = async (place, date, plans) => {
    const placeInfo = await getGeoCoordinates(place);
    const weatherData = await getHistoricalWeatherData(placeInfo.lat, placeInfo.lon, date);
    
    // Combine all info for the AI model
    const comprehensiveData = {
        ...weatherData,
        name: placeInfo.name,
        date: date,
        plans: plans,
        coordinates: { lat: placeInfo.lat, lon: placeInfo.lon }
    };

    const result = await getAIAnalysis(comprehensiveData);
    return result;
};