import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// Grid layout positions for states
const statePositions = {
  'ME': { gridColumn: 12, gridRow: 1 },
  'WI': { gridColumn: 7, gridRow: 2 },
  'VT': { gridColumn: 11, gridRow: 2 },
  'NH': { gridColumn: 12, gridRow: 2 },
  'WA': { gridColumn: 2, gridRow: 2 },
  'MT': { gridColumn: 3, gridRow: 2 },
  'ND': { gridColumn: 4, gridRow: 2 },
  'MN': { gridColumn: 6, gridRow: 2 },
  'MI': { gridColumn: 8, gridRow: 2 },
  'NY': { gridColumn: 10, gridRow: 2 },
  'MA': { gridColumn: 12, gridRow: 3 },
  'RI': { gridColumn: 12, gridRow: 4 },
  'OR': { gridColumn: 2, gridRow: 3 },
  'ID': { gridColumn: 3, gridRow: 3 },
  'WY': { gridColumn: 4, gridRow: 3 },
  'SD': { gridColumn: 5, gridRow: 3 },
  'IA': { gridColumn: 6, gridRow: 3 },
  'IL': { gridColumn: 7, gridRow: 3 },
  'IN': { gridColumn: 8, gridRow: 3 },
  'OH': { gridColumn: 9, gridRow: 3 },
  'PA': { gridColumn: 10, gridRow: 3 },
  'NJ': { gridColumn: 11, gridRow: 3 },
  'CT': { gridColumn: 12, gridRow: 5 },
  'CA': { gridColumn: 2, gridRow: 4 },
  'NV': { gridColumn: 3, gridRow: 4 },
  'UT': { gridColumn: 4, gridRow: 4 },
  'CO': { gridColumn: 5, gridRow: 4 },
  'NE': { gridColumn: 6, gridRow: 4 },
  'MO': { gridColumn: 7, gridRow: 4 },
  'KY': { gridColumn: 8, gridRow: 4 },
  'WV': { gridColumn: 9, gridRow: 4 },
  'VA': { gridColumn: 10, gridRow: 4 },
  'MD': { gridColumn: 11, gridRow: 4 },
  'DE': { gridColumn: 11, gridRow: 5 },
  'AZ': { gridColumn: 3, gridRow: 5 },
  'NM': { gridColumn: 4, gridRow: 5 },
  'KS': { gridColumn: 5, gridRow: 5 },
  'AR': { gridColumn: 6, gridRow: 5 },
  'TN': { gridColumn: 7, gridRow: 5 },
  'NC': { gridColumn: 8, gridRow: 5 },
  'SC': { gridColumn: 9, gridRow: 5 },
  'OK': { gridColumn: 5, gridRow: 6 },
  'LA': { gridColumn: 6, gridRow: 6 },
  'MS': { gridColumn: 7, gridRow: 6 },
  'AL': { gridColumn: 8, gridRow: 6 },
  'GA': { gridColumn: 9, gridRow: 6 },
  'TX': { gridColumn: 5, gridRow: 7 },
  'FL': { gridColumn: 10, gridRow: 7 },
  'AK': { gridColumn: 2, gridRow: 8 },
  'HI': { gridColumn: 2, gridRow: 9 }
};

const styles = {
  container: {
    padding: '2px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    margin: '2px'
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center'
  },
  voteCounter: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '4px'
  },
  candidateCount: {
    textAlign: 'center'
  },
  trump: {
    color: '#dc2626'
  },
  harris: {
    color: '#2563eb'
  },
  candidateName: {
    fontSize: '15px',
    fontWeight: 'bold'
  },
  voteCount: {
    fontSize: '18px',
    fontWeight: 'bold'
  },
  mapContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridTemplateRows: 'repeat(9, 1fr)',
    gap: '4px',
    width: '100%',
    maxWidth: '800px',
    height: '250px',
    margin: '0 auto',
    position: 'relative'
  },
  stateBox: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: 'white',
    fontSize: '12px',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.2s ease'
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '12px',
    width: '200px',
    zIndex: 10,
    transform: 'translateY(-100%)',
    marginTop: '-8px'
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '24px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  legendBox: {
    width: '16px',
    height: '16px'
  }
};

const ElectoralMap = ({ dataFile, title = '2024 Electoral Map' }) => {
  const [electionData, setElectionData] = useState({});
  const [totalVotes, setTotalVotes] = useState({ Trump: 0, Harris: 0 });
  const [hoveredState, setHoveredState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!dataFile) {
          throw new Error('No data file path provided');
        }

        const response = await fetch(dataFile);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const csvText = await response.text();
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true
        });

        if (parsed.errors.length > 0) {
          console.warn('CSV parsing errors:', parsed.errors);
        }

        const stateData = {};
        let trumpVotes = 0;
        let harrisVotes = 0;

        parsed.data.forEach(row => {
          stateData[row.State] = {
            winner: row.Winner,
            votes: parseInt(row.Votes),
            info: JSON.parse(row.Info.replace(/'/g, '"'))
          };
          
          if (row.Winner === 'Trump') {
            trumpVotes += parseInt(row.Votes);
          } else {
            harrisVotes += parseInt(row.Votes);
          }
        });

        setElectionData(stateData);
        setTotalVotes({ Trump: trumpVotes, Harris: harrisVotes });
        setError(null);
      } catch (error) {
        console.error('Error loading election data:', error);
        setError(`Failed to load election data: ${error.message}`);
      }
    };

    loadData();
  }, [dataFile]);

  const StateBox = ({ state }) => {
    const stateData = electionData[state];
    if (!stateData) return null;

    const position = statePositions[state];
    const isHovered = hoveredState === state;
    
    const stateStyle = {
      ...styles.stateBox,
      backgroundColor: stateData.winner === 'Trump' ? '#dc2626' : '#2563eb',
      gridColumn: position.gridColumn,
      gridRow: position.gridRow
    };

    return (
      <div
        style={stateStyle}
        onMouseEnter={() => setHoveredState(state)}
        onMouseLeave={() => setHoveredState(null)}
      >
        {state}
        {isHovered && (
          <div style={styles.tooltip}>
            <p style={{ fontWeight: 'bold' }}>{state}</p>
            <p>Winner: {stateData.winner}</p>
            <p>Electoral votes: {stateData.votes}</p>
            <p>Harris: {stateData.info[0][1]}%</p>
            <p>Trump: {stateData.info[1][1]}%</p>
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{title}</h2>
      
      <div style={styles.voteCounter}>
        <div style={styles.candidateCount}>
          <div style={{ ...styles.candidateName, ...styles.harris }}>Harris</div>
          <div style={styles.voteCount}>{totalVotes.Harris}</div>
        </div>
        <div style={styles.candidateCount}>
          <div style={{ ...styles.candidateName, ...styles.trump }}>Trump</div>
          <div style={styles.voteCount}>{totalVotes.Trump}</div>
        </div>
      </div>

      <div style={styles.mapContainer}>
        {Object.keys(statePositions).map(state => (
          <StateBox key={state} state={state} />
        ))}
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, backgroundColor: '#2563eb' }}></div>
          <span>Harris</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, backgroundColor: '#dc2626' }}></div>
          <span>Trump</span>
        </div>
      </div>
    </div>
  );
};

export default ElectoralMap;