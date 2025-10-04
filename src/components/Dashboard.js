import React from 'react';

const Dashboard = ({ analysis }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      minHeight: '300px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.5rem' }}>🤖</div>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700',
          color: '#2d3748',
          margin: 0
        }}>
          AI Climate Analysis
        </h2>
      </div>
      
      {analysis ? (
        <div style={{ 
          color: '#4a5568',
          lineHeight: '1.8',
          fontSize: '0.95rem'
        }}>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'inherit',
            margin: 0,
            background: '#f7fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            {analysis}
          </pre>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#718096'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌤️</div>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
            Your personalized weather analysis, precautions, and packing list will appear here once you submit a query.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
