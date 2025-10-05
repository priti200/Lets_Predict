import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-left">© {new Date().getFullYear()} GeoClima AI</div>
        <div className="footer-right">NASA-powered insights • Built with ❤️</div>
      </div>
    </footer>
  );
};

export default Footer;
