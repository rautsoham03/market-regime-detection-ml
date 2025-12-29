import { BookOpen, TrendingUp, AlertTriangle, Activity, Search } from "lucide-react";

export default function StrategyGuide() {
  return (
    <div className="animate-fade-in delay-1" style={styles.container}>
      <div style={styles.header}>
        <BookOpen size={24} color="#2563eb" />
        <h2 style={styles.title}>Regime Strategy Guide</h2>
      </div>
      <p style={styles.subtitle}>
        Understanding the mathematical logic behind our market classification engine.
      </p>

      <div style={styles.grid}>
        {/* SECTION 1: THE REGIMES */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🚦 The 3 Market Regimes</h3>
          <div style={styles.cardList}>
            
            <div style={{...styles.card, borderLeft: '4px solid #10b981'}}>
              <div style={styles.cardHeader}>
                <TrendingUp size={18} color="#10b981" />
                <span style={styles.cardTitleText}>Stable / Bull</span>
              </div>
              <p style={styles.cardDesc}>
                <strong>Logic:</strong> Low Volatility + Positive Trend.<br/>
                <strong>Math:</strong> Annualized Volatility &lt; 15% AND Moving Average Slope &gt; 0.<br/>
                <strong>Playbook:</strong> Maximize equity exposure. The market is behaving normally.
              </p>
            </div>

            <div style={{...styles.card, borderLeft: '4px solid #f59e0b'}}>
              <div style={styles.cardHeader}>
                <Activity size={18} color="#f59e0b" />
                <span style={styles.cardTitleText}>Uncertain / Transition</span>
              </div>
              <p style={styles.cardDesc}>
                <strong>Logic:</strong> Rising Volatility OR Broken Trend.<br/>
                <strong>Math:</strong> Volatility spike &gt; 20% OR Price crosses below 200-day avg.<br/>
                <strong>Playbook:</strong> Reduce leverage. The trend is losing momentum or changing direction.
              </p>
            </div>

            <div style={{...styles.card, borderLeft: '4px solid #ef4444'}}>
              <div style={styles.cardHeader}>
                <AlertTriangle size={18} color="#ef4444" />
                <span style={styles.cardTitleText}>Crisis / Bear</span>
              </div>
              <p style={styles.cardDesc}>
                <strong>Logic:</strong> High Volatility + Negative Trend.<br/>
                <strong>Math:</strong> Volatility &gt; 30% AND Drawdown &gt; 15%.<br/>
                <strong>Playbook:</strong> Cash is king. Prioritize capital preservation over returns.
              </p>
            </div>

          </div>
        </div>

        {/* SECTION 2: THE METRICS */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔍 Key Metrics Explained</h3>
          
          <div style={styles.metricRow}>
            <div style={styles.iconBox}><Activity size={20} color="#64748b"/></div>
            <div>
              <span style={styles.metricName}>Volatility Ratio</span>
              <p style={styles.metricDesc}>
                We compare <strong>Short-Term Volatility (20-day)</strong> vs. <strong>Long-Term Volatility (60-day)</strong>. 
                If the ratio crosses <strong>1.5x</strong>, it triggers an "Early Warning" because risk is accelerating.
              </p>
            </div>
          </div>

          <div style={styles.metricRow}>
             <div style={styles.iconBox}><Search size={20} color="#64748b"/></div>
             <div>
              <span style={styles.metricName}>Regime Duration</span>
              <p style={styles.metricDesc}>
                Markets tend to move in clusters. If a regime has persisted for <strong>&gt;90 days</strong>, 
                our model increases confidence in the trend, reducing the likelihood of "False Alarms."
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles: any = {
  container: { background: '#fff', borderRadius: '16px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  title: { fontSize: '22px', fontWeight: 700, margin: 0, color: '#0f172a' },
  subtitle: { color: '#64748b', marginBottom: '40px', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' },
  sectionTitle: { fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  cardTitleText: { fontWeight: 700, fontSize: '14px', color: '#0f172a' },
  cardDesc: { fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 },
  metricRow: { display: 'flex', gap: '16px', marginBottom: '24px' },
  iconBox: { width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  metricName: { fontWeight: 700, fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' },
  metricDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.5', margin: 0 }
};
