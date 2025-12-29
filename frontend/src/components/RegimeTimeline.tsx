import { useEffect, useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, CartesianGrid, Legend 
} from "recharts";
import { API_BASE } from "../config";

type TimelinePoint = {
  date: string;
  close: number;
  regime_label: "Stable" | "Uncertain" | "Crisis";
};

export default function RegimeTimeline({ selectedDate }: { selectedDate?: string }) {
  const [data, setData] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/regime-timeline`)
      .then((res) => res.json())
      .then((rawData) => {
        // Ensure numbers are floats
        const formattedData = rawData.map((d: any) => ({
          ...d,
          close: parseFloat(d.close),
        }));
        setData(formattedData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={styles.loading}>Loading market timeline...</div>
  );

  return (
    <section style={styles.container}>
      <h3 style={styles.title}>NIFTY 50 Regime Timeline</h3>
      
      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} minTickGap={40} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={50} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            <Legend verticalAlign="top" height={36} iconType="circle" />

            {selectedDate && (
              <ReferenceLine x={selectedDate} stroke="#2563eb" strokeDasharray="3 3" label={{ value: 'Analysis Date', position: 'insideTopLeft', fill: '#2563eb', fontSize: 11 }} />
            )}

            {/* Base line for trend */}
            <Line type="monotone" dataKey="close" stroke="#cbd5e1" strokeWidth={1} dot={false} name="Trend" legendType="none"/>

            {/* Colored Segments */}
            {data.map((entry, index) => {
              if (index === 0) return null;
              const prev = data[index - 1];
              let color = "#cbd5e1"; // Default
              if (entry.regime_label === "Stable") color = "#10b981";
              if (entry.regime_label === "Uncertain") color = "#f59e0b";
              if (entry.regime_label === "Crisis") color = "#ef4444";

              return (
                <Line
                  key={`seg-${index}`}
                  data={[prev, entry]}
                  dataKey="close"
                  stroke={color}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}
            
            {/* Dummy Legend Items */}
            <Line name="Stable" data={[]} stroke="#10b981" strokeWidth={3} />
            <Line name="Uncertain" data={[]} stroke="#f59e0b" strokeWidth={3} />
            <Line name="Crisis" data={[]} stroke="#ef4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const styles = {
  container: { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  title: { fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 24px 0' },
  chartWrapper: { width: '100%', height: '400px' },
  loading: { padding: '60px', textAlign: 'center' as const, color: '#64748b' }
};
