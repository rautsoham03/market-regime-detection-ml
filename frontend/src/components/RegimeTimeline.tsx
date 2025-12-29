import { useEffect, useState, useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  CartesianGrid, 
  Legend 
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
        const formattedData = rawData.map((d: any) => ({
          ...d,
          close: parseFloat(d.close),
        }));
        setData(formattedData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // ---------------------------------------------------------
  // 1. DYNAMIC GRADIENT GENERATOR
  // This calculates exactly where colors should change (0% to 100%)
  // based on the regime data points.
  // ---------------------------------------------------------
  const gradientId = "regimeGradient";
  
  const gradientStops = useMemo(() => {
    if (!data || data.length === 0) return [];

    const stops: JSX.Element[] = [];
    const total = data.length;

    data.forEach((entry, index) => {
      // Calculate position as a percentage (0 to 1)
      const offset = index / (total - 1);
      
      let color = "#cbd5e1";
      if (entry.regime_label === "Stable") color = "#10b981"; // Green
      if (entry.regime_label === "Uncertain") color = "#f59e0b"; // Yellow
      if (entry.regime_label === "Crisis") color = "#ef4444"; // Red

      // We add TWO stops per point to create "hard" transitions 
      // instead of blurry fades.
      stops.push(
        <stop key={`start-${index}`} offset={offset} stopColor={color} stopOpacity={1} />
      );
      stops.push(
        <stop key={`end-${index}`} offset={offset} stopColor={color} stopOpacity={1} />
      );
    });

    return stops;
  }, [data]);

  if (loading) return (
    <div style={styles.loading}>Loading market timeline...</div>
  );

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>NIFTY 50 Regime Timeline</h3>
        {/* Custom Header Legend */}
        <div style={styles.legendContainer}>
          <div style={styles.legendItem}><span style={{...styles.dot, background: '#10b981'}}></span>Stable</div>
          <div style={styles.legendItem}><span style={{...styles.dot, background: '#f59e0b'}}></span>Uncertain</div>
          <div style={styles.legendItem}><span style={{...styles.dot, background: '#ef4444'}}></span>Crisis</div>
        </div>
      </div>
      
      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            {/* 2. DEFINITIONS: Apply the Gradient we calculated above */}
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                {gradientStops}
              </linearGradient>
              <linearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="1" y2="0">
                {/* Same gradient but transparent for the area fill */}
                {gradientStops.map((stop: any) => (
                   <stop key={stop.key} offset={stop.props.offset} stopColor={stop.props.stopColor} stopOpacity={0.2} />
                ))}
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} minTickGap={40} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={50} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            
            {selectedDate && (
              <ReferenceLine x={selectedDate} stroke="#2563eb" strokeDasharray="3 3" label={{ value: 'Analysis Date', position: 'insideTopLeft', fill: '#2563eb', fontSize: 11 }} />
            )}

            {/* 3. AREA COMPONENT: This draws the Line AND the Fill */}
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke={`url(#${gradientId})`}   // The Line Color
              fill={`url(#${gradientId}-fill)`} // The Area Fill Color
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }} // Only show dot on hover
              dot={false} // REMOVES THE DOTS EVERYWHERE
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const styles = {
  container: { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 },
  legendContainer: { display: 'flex', gap: '16px' },
  legendItem: { display: 'flex', alignItems: 'center', fontSize: '13px', color: '#64748b', fontWeight: 500 },
  dot: { width: '8px', height: '8px', borderRadius: '50%', marginRight: '6px' },
  chartWrapper: { width: '100%', height: '400px' },
  loading: { padding: '60px', textAlign: 'center' as const, color: '#64748b' }
};
