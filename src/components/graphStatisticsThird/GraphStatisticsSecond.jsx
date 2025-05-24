import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const data = [
    { name: 'ЦМР', value: 13.26 },
    { name: 'КМР', value: 27.39 },
    { name: 'ФМР', value: 33.51 },
    { name: 'ЮМР', value: 39.28 },
    { name: 'ШМР', value: 40.74 },
    { name: 'ЖМР', value: 40.97 },
    { name: 'ЧМР', value: 63.08 },
    { name: 'ГМР', value: 83.01 },
    { name: 'ПМР', value: 89.72 },
    { name: 'СМР', value: 99.11 }
];

const COLORS = [
  '#8E7CC3', '#F6B26B', '#76D7C4', '#F4B400', '#4A90E2',
  '#7CB342', '#7E57C2', '#00BCD4', '#2196F3', '#FDD835'
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={COLORS[index]}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={13}
      fontWeight="bold"
    >
      {`${data[index].name} ${percent > 0 ? `(${(percent * 100).toFixed(2)}%)` : ''}`}
    </text>
  );
};

export default function StreetPieChart() {
  return (
    <div style={{ display: 'flex', userSelect:"none"}}>
        <div style={{ width: '100%', height: 750 }}>
        <PieChart width={1100} height={750}>
            <Pie
            data={data}
            cx={580}
            cy={400}
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={250}
            dataKey="value"
            >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value.toFixed(2)}`, name]} />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
        </div>
        <div style={{ width: '280px' }}>
            <h3 style={{ color: '#0F4CA3', fontWeight: 'bold', marginBottom: '12px' }}>Угроза не наблюдается</h3>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            За отчетные сутки общее потребление электроэнергии в регионе составило
            <strong> 20,405 млн кВт/ч</strong>. Наблюдается выраженный суточный цикл,
            соответствующий рабочему дню: минимум в ночные часы и пик в дневное и вечернее время.
            </p>
            <button style={{ background: '#0F4CA3', color: 'white', padding: '10px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Сформировать отчет
            </button>
        </div>
    </div>
  );
}
