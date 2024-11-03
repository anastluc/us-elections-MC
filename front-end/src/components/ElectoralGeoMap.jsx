import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import Papa from 'papaparse';

const styles = {
  container: {
    padding: '2px',
    backgroundColor: '#f3f4f6',
    borderRadius: '1px',
    margin: '2px'
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center'
  },
  error: {
    color: '#dc2626',
    padding: '20px'
  },
  voteCounter: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '24px'
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
    fontSize: '16px',
    fontWeight: 'bold'
  },
  voteCount: {
    fontSize: '20px',
    fontWeight: 'bold'
  },
  mapContainer: {
    position: 'relative',
    width: '70%',
    margin: '0 auto'
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2px',
    marginTop: '24px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },
  legendBox: {
    width: '12px',
    height: '12px'
  },
  tooltip: {
    position: 'fixed', // Changed from absolute to fixed
    visibility: 'hidden',
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '12px',
    width: '200px',
    zIndex: 10,
    pointerEvents: 'none',
    transform: 'translate(-50%, -100%)', // Centers tooltip above cursor
    marginTop: '-10px' // Adds a small gap between cursor and tooltip
  }
};

const ElectoralGeoMap = ({ dataFile, title = '2024 Electoral Map' }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [electionData, setElectionData] = useState({});
  const [totalVotes, setTotalVotes] = useState({ Trump: 0, Harris: 0 });
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

        // After loading election data, create the map
        createMap(stateData);
      } catch (error) {
        console.error('Error loading election data:', error);
        setError(`Failed to load election data: ${error.message}`);
      }
    };

    loadData();
  }, [dataFile]);

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      if (Object.keys(electionData).length > 0) {
        createMap(electionData);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [electionData]);

  const createMap = async (stateData) => {
    try {
      // Clear any existing content
      d3.select(svgRef.current).selectAll("*").remove();

      // Get container width
      const container = d3.select(svgRef.current.parentNode);
      const containerWidth = parseInt(container.style('width'));
      const width = containerWidth;
      const height = width * 0.618; // Golden ratio for aesthetic proportions

      // Create SVG with viewBox for responsiveness
      const svg = d3.select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Create tooltip
      const tooltip = d3.select(tooltipRef.current);

      // Create projection
      // Adjust scale based on container width
      const scale = width * 1.3;
      const projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(scale);

      // Create path generator
      const path = d3.geoPath().projection(projection);

      // Fetch GeoJSON data for US states
      const response = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
      if (!response.ok) {
        throw new Error('Failed to fetch map data');
      }
      const us = await response.json();

      // Convert TopoJSON to GeoJSON
      const states = topojson.feature(us, us.objects.states);

      // State name conversion helper
      const stateNames = new Map([
        ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
        ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
        ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
        ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
        ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
        ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
        ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
        ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
        ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
        ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
        ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
        ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
        ['WI', 'Wisconsin'], ['WY', 'Wyoming']
      ]);

      // Create reverse mapping
      const stateAbbreviations = new Map(Array.from(stateNames, entry => [entry[1], entry[0]]));

      // Draw states
      svg.selectAll("path")
        .data(states.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", d => {
          const stateName = d.properties.name;
          const stateCode = stateAbbreviations.get(stateName);
          const stateInfo = stateData[stateCode];
          return stateInfo?.winner === 'Trump' ? '#dc2626' : '#2563eb';
        })
        .style("stroke", "#ffffff")
        .style("stroke-width", "0.2px")
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
          const stateName = d.properties.name;
          const stateCode = stateAbbreviations.get(stateName);
          const stateInfo = stateData[stateCode];
          
          tooltip
            .style("visibility", "visible")
            .style("left", event.clientX + "px")
            .style("top", event.clientY + "px")
            .html(`
              <p style="font-weight: bold">${stateName}</p>
              <p>Electoral votes: ${stateInfo?.votes || 'N/A'}</p>
              ${stateInfo ? `
                <p>${stateInfo.info[0][0]}: ${stateInfo.info[0][1]}%</p>
                <p>${stateInfo.info[1][0]}: ${stateInfo.info[1][1]}%</p>
              ` : ''}
            `);
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });

    } catch (error) {
      console.error('Error creating map:', error);
      setError('Failed to create map visualization');
    }
  };

  if (error) {
    return <div style={styles.error}>{error}</div>;
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
        <svg ref={svgRef} style={styles.svg}></svg>
        <div ref={tooltipRef} style={styles.tooltip}></div>
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

export default ElectoralGeoMap;