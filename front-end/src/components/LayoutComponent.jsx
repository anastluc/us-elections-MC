import React from 'react';
import './LayoutComponent.css';

const LayoutComponent = () => {
    const mostRecentSources = {
      "most_frequent":"./data/visuals/election_map_2024_10_23_most_frequent.html",
      "most_improbable_trump":"./data/visuals/election_map_2024_10_23_most_improbable_trump.html",
      "most_improbable_harris":"./data/visuals/election_map_2024_10_23_most_improbable_harris.html",
      "scatter":"./data/visuals/election_map_2024_10_23_scatter.html",
      "histogram":"./data/visuals/election_map_2024_10_23_histogram.html"
    }

    const NmostRecentSources = [      
      {"date":"22nd Oct 2024","frame":"./data/visuals/election_map_2024_10_22_most_frequent.html"},
      {"date":"21st Oct 2024","frame":"./data/visuals/election_map_2024_10_21_most_frequent.html"},
      {"date":"20th Oct 2024","frame":"./data/visuals/election_map_2024_10_20_most_frequent.html"},
      {"date":"19th Oct 2024","frame":"./data/visuals/election_map_2024_10_19_most_frequent.html"},
    ]
    
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="navbar-brand">
              US Elections 2024 Forecast
            </div>
            <div className="navbar-links">
              <a href="/about" className="nav-link">
                About
              </a>
              <a
                href="https://github.com/anastluc/us-elections-MC"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link github-link"
              >
                <svg
                  className="github-icon"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="main-content">
        {/* Left half - Panel A */}
        <div className="panel panel-a">
          <h2 className="panel-title">The most frequent winning combination</h2>
          <div className="panel-content">
            {mostRecentSources['most_frequent'] && (
              <iframe 
                src={mostRecentSources['most_frequent']}
                className="iframe-content"
                title="Most frequent winning combination"
              />
            )}
          </div>

          <div className="panel-d-grid">
              {NmostRecentSources.map((item, index) => (
                <div key={index} className="panel panel-n">
                  <h2 className="panel-title">{item['date']}</h2>
                  <div className="panel-content">
                  <iframe 
                src={item['frame']} 
                className="iframe-content"
                title={"Most frequent winning combination up to "+item['title']}
              />
                    
                  </div>
                </div>
              ))}
            </div>

        </div>
        
        {/* Right half */}
        <div className="right-half">
          {/* Top right - Panel B */}
          <div className="panel panel-b">
            <h2 className="panel-title">Historical data analysis</h2>
            <div className="panel-content">
              <span className="panel-letter">B</span>
            </div>
          </div>
          
          {/* Bottom right */}
          <div className="bottom-panels">
            {/* Bottom left of right half - Panel C */}
            <div className="panel-c-container">
              <div className="panel panel-c">
                <h2 className="panel-title">Statistical trends</h2>
                <div className="panel-content">
                  <span className="panel-letter">C</span>
                </div>
              </div>
              <div className="panel panel-c">
                <h2 className="panel-title">Probability calculations</h2>
                <div className="panel-content">
                  <span className="panel-letter">C</span>
                </div>
              </div>
            </div>
            
            {/* Bottom right of right half - Panel D */}
            <div className="panel-d-grid">
              {[
                "Quick picks", 
                "Number frequency", 
                "Last draws", 
                "Lucky numbers"
              ].map((title, index) => (
                <div key={index} className="panel panel-d">
                  <h2 className="panel-title">{title}</h2>
                  <div className="panel-content">
                    <span className="panel-letter">D</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutComponent;