import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const data = [
  { hour: '01:00', value: 420000 }, { hour: '02:00', value: 430000 },
  { hour: '03:00', value: 440000 }, { hour: '04:00', value: 410000 },
  { hour: '05:00', value: 420000 }, { hour: '06:00', value: 470000 },
  { hour: '07:00', value: 700000 }, { hour: '08:00', value: 850000 },
  { hour: '09:00', value: 960000 }, { hour: '10:00', value: 1020000 },
  { hour: '11:00', value: 1080000 }, { hour: '12:00', value: 1120000 },
  { hour: '13:00', value: 1150000 }, { hour: '14:00', value: 1170000 },
  { hour: '15:00', value: 1160000 }, { hour: '16:00', value: 1130000 },
  { hour: '17:00', value: 1110000 }, { hour: '18:00', value: 1140000 },
  { hour: '19:00', value: 1180000 }, { hour: '20:00', value: 1220000 },
  { hour: '21:00', value: 1190000 }, { hour: '22:00', value: 1040000 },
  { hour: '23:00', value: 900000 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { value } = payload[0];
    return (
      <div style={{
        background: 'white', border: '1px solid #ccc', padding: '6px 10px',
        borderRadius: '4px', fontSize: '14px', color: '#333'
      }}>
        <strong>{value.toLocaleString()} кВт/ч</strong>
      </div>
    );
  }
  return null;
};

export default function HourlyEnergyChart() {
  return (
    <div style={{ display: 'flex' }}>

      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '20px', fontWeight: 500 }}>Средняя почасовая статистика Центрального района</h2>
        <div style={{ height: 650, marginTop: '20px'}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis dataKey="hour" tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={50} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Bar dataKey="value" fill="#7A8BFF" barSize={20} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
