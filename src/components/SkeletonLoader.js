import React from 'react';

const SkeletonLoader = () => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      minHeight: '300px'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ height: '2rem', width: '70%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '1rem' }}></div>
        <div style={{ height: '1rem', width: '90%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
        <div style={{ height: '1rem', width: '80%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
        <div style={{ height: '1rem', width: '85%', background: '#e2e8f0', borderRadius: '8px' }}></div>
      </div>
      <div style={{ height: '10rem', background: '#e2e8f0', borderRadius: '12px', marginBottom: '1.5rem' }}></div>
      <div style={{ height: '5rem', background: '#e2e8f0', borderRadius: '12px' }}></div>
    </div>
  );
};

export default SkeletonLoader;
