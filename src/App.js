import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './components/Header';
import AIPrompt from './components/AIPrompt';
import Map from './components/Map';
import Dashboard from './components/Dashboard';
import SkeletonLoader from './components/SkeletonLoader';
import { getWeatherAnalysis } from './services/weatherService';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePromptSubmit = async ({ place, date, plans }) => {
    if (!place || !date || !plans) {
      alert('Please provide a place, date, and your plans.');
      return;
    }
    setLoading(true);
    const result = await getWeatherAnalysis(place, date, plans);
    setAnalysis(result);
    setCoordinates([result.coordinates.lat, result.coordinates.lon]);
    setLoading(false);
  };

  return (
    <div>
      <Header />
      <Container fluid>
        <Row>
          <Col lg={4} md={12} className="mb-3">
            <AIPrompt onSubmit={handlePromptSubmit} />
            {loading ? (
              <SkeletonLoader />
            ) : (
              <Dashboard analysis={analysis} />
            )}
          </Col>
          <Col lg={8} md={12}>
            <div style={{height: '80vh'}}>
              <Map position={coordinates} />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
