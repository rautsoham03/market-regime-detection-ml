import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { API_BASE } from "../config";
import { Download, TrendingUp, AlertTriangle, Shield, Target, AlertCircle, Activity } from "lucide-react";

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
  early_warning_prob: number;
  recent_regime_change: boolean;
};

const getRegimeStyles = (regime: string) => {
  if (regime.includes("Stable")) return { bg: "#dcfce7", text: "#166534", border: "#22c55e" };
  if (regime.includes("Uncertain")) return { bg: "#fef9c3", text: "#854d0e", border: "#eab308" };
  return { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" };
};

export default function InvestorGuidance({ date }: { date: string }) {
  const [data, setData] = useState<GuidanceResponse | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    fetch(`${API_BASE}/investor-guidance?date=${date}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [date]);

  const exportPDF = () => {
    const el = document.getElementById("guidance-card");
    if (!el) return;
    html2pdf().set({ margin: 0.5, filename: `Guidance_${date}.pdf`, html2canvas: { scale: 2 } }).from(el).save();
  };

  if (loading || !data) return <div style={styles.loadingCard}>Updating Intelligence...</div>;

  const theme = getRegimeStyles(data.regime);
  
  let riskColor = "#10b981";
  if (data.early_warning_prob > 40) riskColor = "#f59e0b";
  if (data.early_warning_prob > 75) riskColor = "#ef4444";

  return (
    <section id="guidance-card" style={styles.card}>
      
      {data.recent_regime_change && (
        <div style={styles.alertBanner}>
          <AlertCircle size={18} /> 
          <span><strong>Regime Alert:</strong> Market state has shifted within the last 5 days. Adjust strategy.</span>
        </div>
      )}

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

      {/* --- UPDATED LABELS FOR CLARITY --- */}
      <div style={styles.grid}>
        {/* Changed from "Avg Return" to "Current Trend" to explain why it might be negative */}
        <MetricBox 
            label="Current Trend (Ann.)" 
            value={`${(data.metrics.average_return * 252 * 100).toFixed(1)}%`} 
            icon={<TrendingUp size={16}/>} 
        />
        {/* Changed to "Current Volatility" to show it's the live risk level */}
        <MetricBox 
            label="Current Volatility (Ann.)" 
            value={`${(data.metrics.volatility * Math.sqrt(252) * 100).toFixed(1)}%`} 
            icon={<Activity size={16}/>} 
        />
        <MetricBox 
            label="Max Drawdown" 
            value={`${(data.metrics.max_drawdown * 100).toFixed(1)}%`} 
            icon={<Download size={16}/>} 
            color="#ef4444"
        />
      </div>

      <div style={styles.riskSection}>
          <div style={{flex: 1}}>
              <h4 style={styles.sectionTitle}><Shield size={18} style={styles.icon}/> Dominant Risk Focus</h4>
              <p style={styles.riskText}>{data.dominant_risk}</p>
          </div>
          <div style={{flex: 1, paddingLeft: '30px', borderLeft: '1px solid #e2e8f0'}}>
               <h4 style={styles.sectionTitle}><AlertTriangle size={18} style={styles.icon}/> Regime Transition Probability</h4>
               <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: riskColor}}>
                  <span>Stable</span>
                  <span>{data.early_warning_prob}% (Early Warning)</span>
                  <span>Critical</span>
               </div>
               <div style={styles.progressBarBg}>
                  <div style={{...styles.progressBarFill, width: `${data.early_warning_prob}%`, backgroundColor: riskColor}}></div>
               </div>
          </div>
      </div>

      <hr style={styles.divider} />

      <div style={styles.strategyRow}>
        <div style={styles.strategyCol}>
          <h4 style={styles.sectionTitle}><Target size={18} style={styles.icon}/> Strategic Objective</h4>
          <p style={styles.text}>{data.objective}</p>
          
          <h4 style={{...styles.sectionTitle, marginTop: '30px'}}>💼 Preferred Investment Avenues</h4>
          <div style={styles.tagContainer}>
            {data.investment_avenues.map((item, k) => (
              <span key={k} style={styles.tag}>{item}</span>
            ))}
          </div>
        </div>

        <div style={styles.strategyCol}>
          <h4 style={styles.sectionTitle}>✅ Recommended Actions</h4>
          <ul style={styles.list}>
            {data.actions.map((a, i) => <li key={i} style={styles.listItem}>{a}</li>)}
          </ul>
        </div>
      </div>

      <div style={{marginTop: '32px', textAlign: 'right' as const}}>
        <button onClick={exportPDF} style={styles.button}>
          <Download size={16} style={{marginRight: 8}}/> Export Report (PDF)
        </button>
      </div>
    </section>
  );
}

const MetricBox = ({ label, value, icon, color = "#1e293b" }: any) => (
  <div style={styles.metricBox}>
    <div style={{display:'flex', alignItems:'center', gap: 6, color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase'}}>
      {icon} {label}
    </div>
    <div style={{fontSize: '26px', fontWeight: 700, marginTop: '8px', color: color}}>{value}</div>
  </div>
);

const styles: any = {
  card: { background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  loadingCard: { height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' },
  alertBanner: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#fff1f2', color: '#991b1b', border: '1px solid #fecdd3', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  cardTitle: { fontSize: '24px', marginBottom: '8px', color: 'var(--primary)' },
  meta: { fontSize: '14px', color: 'var(--text-muted)' },
  badge: { padding: '6px 16px', borderRadius: '20px', fontWeight: 600, fontSize: '14px', borderWidth: '1px', borderStyle: 'solid', display: 'flex', alignItems: 'center' },
  divider: { border: 'none', height: '1px', background: '#e2e8f0', margin: '30px 0' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '30px' },
  metricBox: { padding: '24px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc' },
  riskSection: { display: 'flex', gap: '40px', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' },
  riskText: { fontSize: '16px', fontWeight: 500, color: '#334155', margin: 0 },
  progressBarBg: { height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: '5px', transition: 'width 0.5s ease' },
  strategyRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '20px' },
  sectionTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', marginBottom: '16px' },
  icon: { marginRight: '10px', color: 'var(--accent)' },
  text: { fontSize: '15px', lineHeight: '1.7', color: '#334155', marginBottom: '20px' },
  list: { paddingLeft: '20px', margin: 0 },
  listItem: { marginBottom: '12px', fontSize: '15px', color: '#334155', lineHeight: '1.5' },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  tag: { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '6px', fontSize: '14px', color: '#475569', fontWeight: 600 },
  button: { display: 'inline-flex', alignItems: 'center', padding: '12px 24px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
};
