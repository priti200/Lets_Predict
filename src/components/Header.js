import React from 'react';

const Header = ({ theme = 'light', onToggleTheme, onBrandClick }) => {
  return (
    <div className="header-bar">
      <div className="header-inner">
        <button type="button" className="brand-link" onClick={onBrandClick} aria-label="Go to landing page">
          <div className="brand-group">
            <div className="brand-icon">🌍</div>
            <div>
              <h1 className="brand-title">GeoClima AI</h1>
              <p className="brand-subtitle">NASA-Powered Climate Intelligence</p>
            </div>
          </div>
        </button>
        <div>
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle dark/light theme"
            title="Toggle dark/light theme"
          >
            {theme === 'dark' ? '🌙 Dark' : '🌞 Light'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
