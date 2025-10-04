const Header = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1.5rem 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🌍</div>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>
              GeoClima AI
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.9rem' }}>
              NASA-Powered Climate Intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
