import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import _ from 'lodash';

const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '0 auto'
  },
  header: {
    marginBottom: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 0,
    marginBottom: '16px'
  },
  chartContainer: {
    height: '500px',
    width: '100%'
  }
};

const WinningCombinationsTrend = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/winning_combinations_counts.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvData = await response.text();
        
        const parsedData = Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        // Sort data by date
        const sortedData = parsedData.data.sort((a, b) => {
          return new Date(a.date.replace(/_/g, '-')) - new Date(b.date.replace(/_/g, '-'));
        });

        // Calculate 10-day rolling averages
        const windowSize = 10;
        const rollingData = sortedData.map((item, index, array) => {
          // Get the window of past 10 days (or fewer if at the start)
          const window = array.slice(Math.max(0, index - windowSize + 1), index + 1);
          
          // Calculate averages
          const harrisAvg = _.meanBy(window, 'harris_winning_combinations_ctn');
          const trumpAvg = _.meanBy(window, 'trump_winning_combinations_ctn');
          
          return {
            ...item,
            harris_rolling_avg: Math.round(harrisAvg),
            trump_rolling_avg: Math.round(trumpAvg)
          };
        });
        
        setData(rollingData);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    };

    fetchData();
  }, []);

  // Format the date to be more readable
  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('_');
    return `${month}/${day}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          Winning Combinations Trend with 10-Day Moving Average (July - October 2024)
        </h2>
      </div>
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              interval={6}
            />
            <YAxis 
              domain={[0, 1000]}
              tickCount={11}
            />
            <Tooltip 
              labelFormatter={(value) => {
                const [year, month, day] = value.split('_');
                return `${month}/${day}/${year}`;
              }}
              formatter={(value, name) => {
                const labels = {
                  harris_winning_combinations_ctn: 'Harris Daily',
                  trump_winning_combinations_ctn: 'Trump Daily',
                  harris_rolling_avg: 'Harris 10-Day Avg',
                  trump_rolling_avg: 'Trump 10-Day Avg'
                };
                return [`${value} combinations`, labels[name]];
              }}
            />
            <Legend 
              formatter={(value) => {
                const labels = {
                  harris_winning_combinations_ctn: 'Harris Daily',
                  trump_winning_combinations_ctn: 'Trump Daily',
                  harris_rolling_avg: 'Harris 10-Day Moving Average',
                  trump_rolling_avg: 'Trump 10-Day Moving Average'
                };
                return labels[value];
              }}
            />
            {/* Daily values - thinner, more transparent lines */}
            <Line
              type="monotone"
              dataKey="harris_winning_combinations_ctn"
              stroke="#2563eb"
              strokeWidth={1}
              dot={false}
              activeDot={{ r: 6 }}
              strokeOpacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="trump_winning_combinations_ctn"
              stroke="#dc2626"
              strokeWidth={1}
              dot={false}
              activeDot={{ r: 6 }}
              strokeOpacity={0.5}
            />
            
            {/* Rolling averages - thicker, solid lines */}
            <Line
              type="monotone"
              dataKey="harris_rolling_avg"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="trump_rolling_avg"
              stroke="#dc2626"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WinningCombinationsTrend;