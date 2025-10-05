import React from 'react';

const ComfortIndex = ({ temp, humidity }) => {
  const calculateComfortIndex = (t, h) => {
    // Simplified formula
    return t - 0.55 * (1 - (h / 100)) * (t - 14.5);
  };

  const comfortIndex = calculateComfortIndex(temp, humidity);
  let comfortLevel = '';
  let comfortColor = '';

  if (comfortIndex < 18) {
    comfortLevel = 'Cold';
    comfortColor = 'blue';
  } else if (comfortIndex >= 18 && comfortIndex < 24) {
    comfortLevel = 'Comfortable';
    comfortColor = 'green';
  } else if (comfortIndex >= 24 && comfortIndex < 30) {
    comfortLevel = 'Warm';
    comfortColor = 'orange';
  } else {
    comfortLevel = 'Hot';
    comfortColor = 'red';
  }

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h3>Comfort Index</h3>
      </div>
      <div className="card-body">
        <h4 style={{ color: comfortColor }}>{comfortLevel}</h4>
        <p>Comfort Index: {comfortIndex.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ComfortIndex;
