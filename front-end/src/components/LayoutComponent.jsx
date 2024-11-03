// Layout.jsx
import React, { useState } from 'react';
import { Github } from 'lucide-react'
import './LayoutComponent.css'
import WinningCombinationsTrend from './WinningCombinationsTrend'
import ElectoralMap from './ElectoralMap'
import ElectoralGeoMap from './ElectoralGeoMap'
import ErrorFunction from './ErrorFunction'

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>About This Project</h2>
        <div className="modal-text">
          <p>
            This project uses Monte Carlo simulations to forecast the 2024 US Presidential Election 
            based on current polling data. The methodology involves:
          </p>
          <ul>
            <li>Collecting and analyzing state-by-state polling data</li>
            <li>Converting poll spreads to win probabilities using error functions</li>
            <li>Running 1000 simulations to generate different electoral outcomes</li>
            <li>Visualizing the results and tracking trends over time</li>
          </ul>
          <p>
            The simulations take into account statistical uncertainty and help understand 
            the range of possible electoral outcomes based on current polling data.
          </p>
          <p>
            For more technical details and access to the source code, please visit the 
            GitHub repository linked in the navigation bar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Layout() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const up_to_date = "2024_11_02"
  const up_to_date_human = "2nd November 2024"

  const dates = [
      "2024_10_29",
      "2024_10_30", 
      "2024_10_31", 
      "2024_11_01",      
    ];
  const most_frequent_src = `./data/visuals/election_map_${up_to_date}_most_frequent.html`
  const most_frequent_data = `./data/election_map_${up_to_date}_most_frequent.csv`

  const scatter_src = `./data/visuals/election_map_${up_to_date}_scatter.html`
  const histogram_src = `./data/visuals/election_map_${up_to_date}_histogram.html`

  const improbable_src = {
    "trump":`./data/election_map_${up_to_date}_most_improbable_trump.csv`,
    "harris":`./data/election_map_${up_to_date}_most_improbable_harris.csv`
  }

  const past_few_days_most_frequent = [      
    {"date":"1st Nov 2024","data_src":`./data/election_map_${dates[3]}_most_frequent_1.csv`},
    {"date":"31st Oct 2024","data_src":`./data/election_map_${dates[2]}_most_frequent_2.csv`},
    {"date":"30th Oct 2024","data_src":`./data/election_map_${dates[1]}_most_frequent_3.csv`},
    {"date":"29th Oct 2024","data_src":`./data/election_map_${dates[0]}_most_frequent_4.csv`},
    
  ]

  const NmostRecentSources = [
    `./data/election_map_${up_to_date}_most_frequent_1.csv`,
    `./data/election_map_${up_to_date}_most_frequent_2.csv`,
    `./data/election_map_${up_to_date}_most_frequent_3.csv`,
    `./data/election_map_${up_to_date}_most_frequent_4.csv`  
  ]

  return (
    <div>
      <nav>
        <div className="logo">Forecasting US elections 2024 with Monte Carlo simulations</div>
        <div className="nav-links">
          <a href="#" onClick={(e) => {
            e.preventDefault();
            setIsModalOpen(true);
          }}>About</a>
          <a href="https://github.com/anastluc/us-elections-MC">
            <Github size={24} />
          </a>
        </div>
      </nav>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="container">
        {/* First row - full width */}
        <div className="row">
          <h2>Methodology</h2>
          <p>I ran 1000 simulations of the US elections according to the poll data up to <em>{up_to_date_human}</em></p>
          <p>The way each simulation works is that I 'translate' each poll percentage of each stage to a probability of win, with the use of error function.</p>
          <p><a href="https://en.wikipedia.org/wiki/Error_function">Error function</a> is this sigmoid function below (here to be presice is the normalised to a 5% margin of error, i.e. is 0.5*(1+erf(spreead/5.1))</p>
          <ErrorFunction />
          <p>There is some crucial characteristics of this function: 
            <ul>
              <li>If the poll spread is 0, e.g. 45% to 45%, or 40% to 40% then the propability is equal, 50% - 50%, a coinflip</li>
              <li>If the spread is big enough, e.g. 6%: 52% to 46% then the probability of winning the state election approaches 100%. The 6% advantage in polls means that the probability of winning is 95%.</li>
              <li>if the spread is relatively small, in the 1% to 4% range, there is a clear favourite however the chance of an upset is not excluded (e.g. for 2% is 70-30)</li>
            </ul>
          </p>
          <p>Now that we have a probability assigned to each state win, the methodology of this Monte-Carlo simulation is quite simple:</p>
          <p>1. Get the latest poll of each state and calculate the probability of each candidate to win that state (using the above error function). I source polling data from <a href="https://projects.fivethirtyeight.com/polls/data/president_polls.csv">fivethirtyeight</a></p>
          <p>2. We input a random value and see who wins the state according to the probability. We do this for each state and sum up the electorates of the two candidates.</p>
          <p>3. We repeat the same process for a large number of simulations, in this case 1000.</p>
          <p>You can check the code for running the simulations and generating the visuals below at the <a href="https://github.com/anastluc/us-elections-MC">Github repository</a></p>
          <br/>
          <h2>Most frequent winning combination</h2>
          <p>So, after running this for 1000 times, this is the most frequent winning combination with poll data up to {up_to_date_human}:</p>
          <div className="two-columns">
            <div className="column">
            <ElectoralGeoMap 
          dataFile={most_frequent_data}
          title={"Latest most frequent winning combination (upd.:"+up_to_date_human+")"}
        />  
            </div>
            <div className="column">
            <ElectoralMap 
          dataFile={most_frequent_data}
          title={"Latest most frequent winning combination (upd.:"+up_to_date_human+")"}
        />
            </div>
          </div>
        </div>

<       div className="row">
          <h2>Combination distributions</h2>
          <div className="two-columns">
            <div className="column">
              <iframe src={scatter_src} title="column 1" />
            </div>
            <div className="column">
              <iframe src={histogram_src} title="column 2" />
            </div>
          </div>
        </div>
        

        <div className="row">
          <h1>Trend</h1>
          <p>I have been doing this since 1st July. Here is what portion of the 1000 simulations the two candidates are winning over time: </p>
          <WinningCombinationsTrend />        
        </div>

        <div className="row">
          <h2>Other frequent combinations as of {up_to_date_human}</h2>
          <div className="four-columns">
            <div className="column">
              <h4>2nd most frequent</h4>
              <ElectoralMap 
          dataFile={NmostRecentSources[0]}
          title=""
        />
            </div>
            <div className="column">
            <h4>3rd most frequent</h4>
            <ElectoralMap 
          dataFile={NmostRecentSources[1]}
          title=""
        />
            </div>
            <div className="column">
            <h4>4th most frequent</h4>
            <ElectoralMap 
          dataFile={NmostRecentSources[2]}
          title=""
        />
            </div>
            <div className="column">
            <h4>5th most frequent</h4>
            <ElectoralMap 
          dataFile={NmostRecentSources[3]}
          title=""
        />
            </div>
          </div>
        </div>
 
        <div className="row">
          <h2>Past few days most frequent winning combination</h2>
          <div className="four-columns">
            <div className="column">
              <h4>{past_few_days_most_frequent[0]["date"]}</h4>
              <ElectoralMap 
                dataFile={past_few_days_most_frequent[0]["data_src"]}
                title=""
              />
            </div>
            <div className="column">
            <h4>{past_few_days_most_frequent[1]["date"]}</h4>
            <ElectoralMap 
                dataFile={past_few_days_most_frequent[1]["data_src"]}
                title=""
              />
            </div>
            <div className="column">
            <h4>{past_few_days_most_frequent[2]["date"]}</h4>
            <ElectoralMap 
                dataFile={past_few_days_most_frequent[2]["data_src"]}
                title=""
              />
            </div>
            <div className="column">
            <h4>{past_few_days_most_frequent[3]["date"]}</h4>
            <ElectoralMap 
                dataFile={past_few_days_most_frequent[3]["data_src"]}
                title=""
              />
            </div>
          </div>
        </div>

        <div className="row">
          <h2>Most improbable combinations</h2>
          <div className="two-columns">
            <div className="column">
            <ElectoralMap 
                dataFile={improbable_src["harris"]}
                title="Most improbable with Harris as winner"
              />
            
            </div>
            <div className="column">
            <ElectoralMap 
                dataFile={improbable_src["trump"]}
                title="Most improbable with Trump as winner"
              />
            </div>
          </div>
        </div>

        <div className="row">
          <h2>Final Section</h2>
          <span>What do prediction markets say?</span>
          <p><a href="https://kalshi.com/markets/pres/presidential-elections/?referral=#pres-2024">kalshi</a></p>
          <p><a href="https://www.oddschecker.com/politics/us-politics/us-presidential-election/winner">betting companies</a></p>
          <p>
            <a href="https://polymarket.com/event/presidential-election-winner-2024">Polymarket</a>
            </p>
            <p>
          <iframe
	title="polymarket-market-iframe"
	src="https://embed.polymarket.com/market.html?market=will-donald-trump-win-the-2024-us-presidential-election&features=volume&theme=light"
	width="400"
	height="180"
	frameBorder="0"
/>
            
            </p>

        </div> 
      </div>

      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .modal-content {
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
          }

          .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
          }

          .modal-close:hover {
            opacity: 0.7;
          }

          .modal-text {
            margin-top: 1rem;
          }

          .modal-text p {
            margin-bottom: 1rem;
            line-height: 1.5;
          }

          .modal-text ul {
            margin: 1rem 0;
            padding-left: 2rem;
          }

          .modal-text li {
            margin-bottom: 0.5rem;
            line-height: 1.5;
          }

          h2 {
            margin-bottom: 1.5rem;
            color: #333;
          }
        `}
      </style>
    </div>
  )
}