import { useState } from 'react';
import InvestorGuidance from "./components/InvestorGuidance";
import RegimeTimeline from "./components/RegimeTimeline";
import './App.css'; 
import { Layout, Calendar } from 'lucide-react';

export default function App() {
  // Default date
  const [selectedDate, setSelectedDate] = useState<string>("2024-11-21");

  return (
    <div style={{ width: '100%' }}>
      
      {/* HEADER */}
      <header style={styles.header}>
        <div className="container" style={styles.headerContent}>
          <div className="animate-fade-in delay-1">
            <div style={styles.logoRow}>
              <Layout size={24} color="#2563eb" />
              <h1 style={styles.brandName}>Market Regime Analytics</h1>
            </div>
            <p style={styles.subtitle}>Regime-aware market insights for long-term investors</p>
          </div>

          <div className="animate-fade-in delay-1" style={styles.dateControl}>
            <label style={styles.label}>ANALYSIS DATE</label>
            <div style={styles.inputWrapper}>
              <Calendar size={16} color="#64748b" style={{marginRight: 8}}/>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                style={styles.dateInput}
              />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container" style={styles.main}>
        {/* Dashboard Card */}
        <div className="animate-fade-in delay-2">
          <InvestorGuidance date={selectedDate} />
        </div>
        
        {/* Timeline Chart */}
        <div className="animate-fade-in delay-3">
          <RegimeTimeline selectedDate={selectedDate} />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="animate-fade-in delay-3" style={styles.footer}>
        <p>© 2025 Market Regime Analytics • Internal Use Only</p>
      </footer>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '24px 0',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '20px',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' },
  brandName: { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
  dateControl: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end' },
  label: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' },
  inputWrapper: { display: 'flex', alignItems: 'center', background: '#fff' },
  dateInput: {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    color: '#1e293b',
    outline: 'none',
    fontFamily: 'inherit'
  },
  main: { margin: '40px auto', display: 'flex', flexDirection: 'column' as const, gap: '32px', paddingBottom: '60px' },
  footer: { textAlign: 'center' as const, padding: '40px 0', color: '#94a3b8', fontSize: '13px', borderTop: '1px solid #e2e8f0', width: '100%', backgroundColor: '#fff' },
};
