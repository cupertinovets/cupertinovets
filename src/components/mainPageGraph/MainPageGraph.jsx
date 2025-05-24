import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const data = [
  { value: 81, percent: '8.0%' },
  { value: 58, percent: '12.9%' },
  { value: 47, percent: '10.4%' },
  { value: 95, percent: '21.1%' },
  { value: 4,  percent: '0.9%' },
  { value: 40, percent: '8.9%' },
  { value: 12, percent: '2.7%' },
  { value: 90, percent: '20.0%' },
  { value: 23, percent: '5.1%' },
];

const CustomXAxisTick = ({ x, y, payload }) => {
  const item = data[payload.index];
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={15} dy={-6} 
      textAnchor="middle" fill="#333" fontWeight="bold">{item.value}</text>
      <text x={0} y={25} 
      textAnchor="middle" fill="#666" fontSize="12">{item.percent}</text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { value } = payload[0];
    return (
      <div style={{
        background: 'white',
        border: '1px solid #ccc',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#333',
        fontFamily: "Qanelas"
      }}>
        <strong>{value}</strong>
      </div>
    );
  }
  return null;
};

export default function CustomBarChart() {
  return (
    <div className='mainPageGraph'>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={data}
          margin={{ top: 30, right: 30, left: 30, bottom: 40 }}
        >
          <XAxis dataKey="value" tick={<CustomXAxisTick />} interval={0} axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#007bff" barSize={15} radius={[10, 10, 0, 0]}>
            {
              data.map((_, index) => (
                <Cell key={`cell-${index}`} />
              ))
            }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
