import React from 'react';
import ReactMarkdown from 'react-markdown';
import DataSources from './DataSources';
import WeatherChart from './WeatherChart';
import DataSummary from './DataSummary';
import ComfortIndex from './ComfortIndex';

const Dashboard = ({ analysis }) => {
  const handleDownload = () => {
    if (!analysis || !analysis.weatherData || !analysis.weatherData.realTime) {
      return;
    }
    const data = {
      analysis: analysis.analysisText,
      weatherData: analysis.weatherData,
      comfortIndex: {
        temp: analysis.weatherData.realTime.temp,
        humidity: analysis.weatherData.realTime.humidity,
      }
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weather_analysis.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div className="h1 me-3">🤖</div>
          <h2 className="h5 mb-0">AI Climate Analysis</h2>
        </div>
        {analysis && <button onClick={handleDownload} className="btn btn-primary">Download Data</button>}
      </div>
      
      {analysis && analysis.weatherData && analysis.weatherData.realTime ? (
        <div>
          <div className="mb-4">
            <ReactMarkdown>
              {analysis.analysisText}
            </ReactMarkdown>
          </div>
          <WeatherChart data={analysis.weatherData} />
          <DataSummary data={analysis.weatherData} />
          <ComfortIndex temp={analysis.weatherData.realTime.temp} humidity={analysis.weatherData.realTime.humidity} />
        </div>
      ) : (
        <div className="text-center p-5 text-muted">
          <div className="h1 mb-3">🌤️</div>
          <p className="lead">Your personalized weather analysis, precautions, and packing list will appear here once you submit a query.</p>
        </div>
      )}
      <DataSources />
    </div>
  );
};

export default Dashboard;