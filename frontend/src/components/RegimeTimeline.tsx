import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { API_BASE } from "../config";

type TimelinePoint = {
  date: string;
  close: number;
  regime_label: "Stable" | "Uncertain" | "Crisis";
};

// Corporate Colors
const regimeColor = (label: string) => {
  if (label === "Stable") return "#10b981"; // Success Green
  if (label === "Uncertain") return "#f59e0b"; // Warning Amber
  return "#ef4444"; // Danger Red
};

// DEFINING PROPS HERE FIXES THE ERROR
export default function RegimeTimeline({ selectedDate }: { selectedDate?: string }) {
  const [data, setData] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/regime-timeline`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading market timeline...</div>;

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>NIFTY 50 Regime Timeline</h3>
        <div style={styles.legend}>
          <LegendItem color="#10b981" label="Stable" />
          <LegendItem color="#f59e0b" label="Uncertain" />
          <LegendItem color="#ef4444" label="Crisis" />
        </div>
      </div>

      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              minTickGap={30}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            />
            
            {/* Show where the user currently is */}
            {selectedDate && <ReferenceLine x={selectedDate} stroke="#2563eb" strokeDasharray="3 3" />}

            {/* Base grey line for continuity */}
            <Line dataKey="close" stroke="#cbd5e1" strokeWidth={1} dot={false} isAnimationActive={false} />

            {/* Colored segments for Regimes */}
            {data.map((entry, i) => {
              if (i === 0) return null;
              const prev = data[i - 1];
              return (
                <Line
                  key={i}
                  data={[prev, entry]}
                  dataKey="close"
                  stroke={regimeColor(entry.regime_label)}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const LegendItem = ({ color, label }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }}></div>
    {label}
  </div>
);

// We use 'as const' to fix CSS type errors
const styles = {
  container: {
    background: '#fff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: { fontSize: '18px', color: 'var(--primary)' },
  legend: { display: 'flex', gap: '20px' },
  chartWrapper: { fontSize: '12px' },
  loading: { padding: '40px', textAlign: 'center' as const, color: 'var(--text-muted)' }
};
