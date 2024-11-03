import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ErrorFunction = () => {
  // Implementation of error function using Taylor series approximation
  const erf = (x) => {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    // Save the sign of x
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    // A&S formula 7.1.26
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  // Generate data points
  const data = [];
  for (let x = -10; x <= 10; x += 0.5) {
    data.push({
      x,
      y: 0.5 * (1 + erf(x / 5.1))
    });
  }

  return (
    <div>
        
      <ResponsiveContainer minHeight={300}>
        
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="x" 
            label={{ value: 'spread (in %)', position: 'bottom' }}
          />
          <YAxis 
            domain={[0, 1]} 
            label={{ value: 'p(win) = 0.5 * (1 + erf(s/5.1))', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value) => value.toFixed(4)}
            labelFormatter={(value) => `spread = ${value}`}
          />
          <Line 
            type="monotone" 
            dataKey="y" 
            stroke="#8884d8" 
            dot={false} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ErrorFunction;