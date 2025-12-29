import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { API_BASE } from "../config";
import { Download, TrendingUp, AlertTriangle, Shield, Target } from "lucide-react";

type GuidanceResponse = {
  regime: string;
  start_date: string;
  duration_days: number;
  metrics: {
    average_return: number;
    volatility: number;
    max_drawdown: number;
  };
  objective: string;
  dominant_risk: string;
  actions: string[];
  investment_avenues: string[];
  risk_focus: string;
};

// Colors mapping
const getRegimeStyles = (regime: string) => {
  if (regime.includes("Stable")) return { bg: "#dcfce7", text: "#166534", border: "#22c55e", label: "Stable Bull" };
  if (regime.includes("Uncertain")) return { bg: "#fef9c3", text: "#854d0e", border: "#eab308", label: "High Volatility" };
  return { bg: "#fee2e2", text: "#991b1b", border: "#ef4444", label: "Crisis / Bear" };
};

// DEFINING THE PROPS INTERFACE HERE FIXES THE ERROR
export default function InvestorGuidance({ date }: { date: string }) {
  const [data, setData] = useState<GuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    const fetchGuidance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/investor-guidance?date=${date}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch guidance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuidance();
  }, [date]);

  const exportPDF = () => {
    const el = document.getElementById("guidance-card");
    if (!el) return;
    html2pdf().set({ margin: 0.5, filename: `Guidance_${date}.pdf`, html2canvas: { scale: 2 } }).from(el).save();
  };

  if (loading) return <div style={styles.loading}>Generating Investor Intelligence...</div>;
  if (!data) return <div style={styles.empty}>Select a date to view insights.</div>;

  const theme = getRegimeStyles(data.regime);

  return (
    <section id="guidance-card" style={styles.card}>
      {/* Card Header */}
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Investor Intelligence Dashboard</h2>
          <p style={styles.meta}>
            Regime Active Since: <strong>{data.start_date}</strong> • Duration: <strong>{data.duration_days} Days</strong>
          </p>
        </div>
        <div style={{...styles.badge, backgroundColor: theme.bg, color: theme.text, borderColor: theme.border}}>
          <span style={{fontSize: '1.2rem', marginRight: '6px'}}>●</span> {data.regime}
        </div>
      </div>

      <hr style={styles.divider} />

      {/* Metrics Grid */}
      <div style={styles.grid}>
        <MetricBox label="Avg Return" value={`${(data.metrics.average_return * 100).toFixed(2)}%`} icon={<TrendingUp size={16}/>} />
        <MetricBox label="Volatility" value={`${(data.metrics.volatility * 100).toFixed(2)}%`} icon={<AlertTriangle size={16}/>} />
        <MetricBox label="Max Drawdown" value={`${(data.metrics.max_drawdown * 100).toFixed(2)}%`} icon={<Download size={16}/>} color="#ef4444"/>
      </div>

      {/* Strategy Section */}
      <div style={styles.strategyRow}>
        <div style={styles.strategyCol}>
          <h4 style={styles.sectionTitle}><Target size={18} style={styles.icon}/> Strategic Objective</h4>
          <p style={styles.text}>{data.objective}</p>
          
          <h4 style={styles.sectionTitle}><Shield size={18} style={styles.icon}/> Risk Focus</h4>
          <p style={styles.text}>{data.dominant_risk}</p>
        </div>

        <div style={styles.strategyCol}>
          <h4 style={styles.sectionTitle}>✅ Recommended Actions</h4>
          <ul style={styles.list}>
            {data.actions.map((a, i) => <li key={i} style={styles.listItem}>{a}</li>)}
          </ul>
        </div>
      </div>

      {/* Investment Avenues */}
      <div style={{marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px'}}>
        <h4 style={{...styles.sectionTitle, marginBottom: '10px'}}>💼 Preferred Investment Avenues</h4>
        <div style={styles.tagContainer}>
          {data.investment_avenues.map((item, k) => (
            <span key={k} style={styles.tag}>{item}</span>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div style={{marginTop: '24px', textAlign: 'right' as const}}>
        <button onClick={exportPDF} style={styles.button}>
          <Download size={16} style={{marginRight: 8}}/> Export Report (PDF)
        </button>
      </div>
    </section>
  );
}

// Helper Component
const MetricBox = ({ label, value, icon, color = "#1e293b" }: any) => (
  <div style={styles.metricBox}>
    <div style={{display:'flex', alignItems:'center', gap: 6, color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase'}}>
      {icon} {label}
    </div>
    <div style={{fontSize: '24px', fontWeight: 700, marginTop: '8px', color: color}}>{value}</div>
  </div>
);

// CSS Styles
const styles: any = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  cardTitle: { fontSize: '22px', marginBottom: '4px', color: 'var(--primary)' },
  meta: { fontSize: '14px', color: 'var(--text-muted)' },
  badge: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontWeight: 600,
    fontSize: '14px',
    borderWidth: '1px',
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
  },
  divider: { border: 'none', height: '1px', background: '#e2e8f0', margin: '20px 0' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' },
  metricBox: { padding: '20px', borderRadius: '8px', border: '1px solid #f1f5f9', background: '#fcfcfc' },
  strategyRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '20px' },
  sectionTitle: { fontSize: '15px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', marginBottom: '12px' },
  icon: { marginRight: '8px', color: 'var(--accent)' },
  text: { fontSize: '15px', lineHeight: '1.6', color: '#334155', marginBottom: '20px' },
  list: { paddingLeft: '20px', margin: 0 },
  listItem: { marginBottom: '8px', fontSize: '15px', color: '#334155' },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  tag: { background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '14px', color: '#475569', fontWeight: 500 },
  button: {
    display: 'inline-flex', alignItems: 'center', padding: '10px 20px', background: 'var(--primary)', color: '#fff', 
    border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s'
  },
  loading: { padding: '40px', textAlign: 'center' as const, color: 'var(--text-muted)' },
  empty: { padding: '40px', textAlign: 'center' as const, color: 'var(--text-muted)', background: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }
};
