import React from 'react';

const DataSources = () => {
  return (
    <div className="card mt-4">
      <div className="card-header">
        <h3>NASA Data & Resources</h3>
      </div>
      <div className="card-body">
        <ul>
          <li><a href="https://disc.gsfc.nasa.gov/data-access" target="_blank" rel="noopener noreferrer">GES DISC OPeNDAP server (Hyrax)</a></li>
          <li><a href="https://giovanni.gsfc.nasa.gov/giovanni/" target="_blank" rel="noopener noreferrer">Giovanni</a></li>
          <li><a href="https://ldas.gsfc.nasa.gov/data-rods" target="_blank" rel="noopener noreferrer">Data Rods for Hydrology</a></li>
          <li><a href="https://worldview.earthdata.nasa.gov/" target="_blank" rel="noopener noreferrer">Worldview</a></li>
          <li><a href="https://search.earthdata.nasa.gov/" target="_blank" rel="noopener noreferrer">Earthdata Search</a></li>
          <li><a href="https://www.nasa.gov/learning-resources/data-access-tutorials/" target="_blank" rel="noopener noreferrer">Data access Tutorials</a></li>
        </ul>
        <h4>Space Agency Partner Resources</h4>
        <ul>
            <li><a href="https://www.gov.br/aeb/pt-br" target="_blank" rel="noopener noreferrer">Brazilian Space Agency (AEB)</a></li>
            <li><a href="http://previsao.cptec.inpe.br/" target="_blank" rel="noopener noreferrer">Center for Weather Forecast and Climate Studies (CPTEC) at the Brazilian National Institute for Space Exploration (INPE)</a></li>
        </ul>
      </div>
    </div>
  );
};

export default DataSources;
