import React from 'react';

const DataSummary = ({ data }) => {
  const calculateMean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const calculateMedian = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  const calculateStdDev = (arr) => {
    const mean = calculateMean(arr);
    const squareDiffs = arr.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  };

  if (!data || !data.temp || !data.humidity || !data.wind) {
    return null;
  }

  const stats = {
    temp: {
      mean: calculateMean(data.temp).toFixed(2),
      median: calculateMedian(data.temp).toFixed(2),
      stdDev: calculateStdDev(data.temp).toFixed(2),
    },
    humidity: {
      mean: calculateMean(data.humidity).toFixed(2),
      median: calculateMedian(data.humidity).toFixed(2),
      stdDev: calculateStdDev(data.humidity).toFixed(2),
    },
    wind: {
      mean: calculateMean(data.wind).toFixed(2),
      median: calculateMedian(data.wind).toFixed(2),
      stdDev: calculateStdDev(data.wind).toFixed(2),
    },
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h3>Data Summary</h3>
      </div>
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Mean</th>
              <th>Median</th>
              <th>Std. Dev.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Temperature (°C)</td>
              <td>{stats.temp.mean}</td>
              <td>{stats.temp.median}</td>
              <td>{stats.temp.stdDev}</td>
            </tr>
            <tr>
              <td>Humidity (%)</td>
              <td>{stats.humidity.mean}</td>
              <td>{stats.humidity.median}</td>
              <td>{stats.humidity.stdDev}</td>
            </tr>
            <tr>
              <td>Wind Speed (m/s)</td>
              <td>{stats.wind.mean}</td>
              <td>{stats.wind.median}</td>
              <td>{stats.wind.stdDev}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataSummary;
