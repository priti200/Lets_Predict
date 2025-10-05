import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import Header from './components/Header';
import AIPrompt from './components/AIPrompt';
import Map from './components/Map';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import { getWeatherAnalysis } from './services/weatherService';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [showResult, setShowResult] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const handlePromptSubmit = async ({ place, date, plans }) => {
    if (!place || !date || !plans) {
      alert('Please provide a place, date, and your plans.');
      return;
    }
    setLoading(true);
    const result = await getWeatherAnalysis(place, date, plans);
    setAnalysis(result.analysisText);
    setCoordinates([result.coordinates.lat, result.coordinates.lon]);
    setLoading(false);
    setShowResult(true);
  };

  // Enter the app from landing
  const enterApp = () => setShowLanding(false);
  const goHome = () => setShowLanding(true);

  return (
    <div>
      <Header theme={theme} onToggleTheme={toggleTheme} onBrandClick={goHome} />

      <div className="content-area">
        <main className={`landing-page page ${showLanding ? 'visible' : 'hidden'}`} aria-hidden={!showLanding}>
          <div className="landing-center">
            <h1 className="landing-title">GeoClima AI</h1>
            <p className="landing-sub">NASA-Powered Climate Intelligence</p>
            <p className="landing-copy">Quickly analyze historical climate and get activity advice for any place and date.</p>
            <button type="button" className="button-primary landing-button" onClick={enterApp}>Enter GeoClima AI</button>
          </div>
        </main>

        <div className={`app-main page ${showLanding ? 'hidden' : 'visible'}`} aria-hidden={showLanding}>
          <Container fluid className="app-content">
            <Row>
              <Col lg={4} md={12} className="left-column">
                {!showResult && <AIPrompt onSubmit={handlePromptSubmit} />}

                {showResult && (
                  <Dashboard analysis={analysis} onBack={() => setShowResult(false)} />
                )}
              </Col>
              <Col lg={8} md={12}>
                <div className="map-wrapper">
                  <Map position={coordinates} />

                  {loading && (
                    <div className="map-overlay" aria-hidden>
                      <Spinner animation="border" role="status" />
                      <div className="map-overlay-text">Analyzing historical data…</div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
