import { useState } from 'react';
import InvestorGuidance from "./components/InvestorGuidance";
import RegimeTimeline from "./components/RegimeTimeline";
import './App.css'; 
import { Layout, Calendar } from 'lucide-react';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>("2024-11-21");

  return (
    <div className="app-wrapper">
      
      {/* HEADER section */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <div style={styles.logoRow}>
              <Layout size={24} color="#2563eb" />
              <h1 style={styles.brandName}>Market Regime Analytics</h1>
            </div>
            <p style={styles.subtitle}>Regime-aware market insights for long-term investors</p>
          </div>

          {/* Date Picker */}
          <div style={styles.dateControl}>
            <label style={styles.label}>ANALYSIS DATE</label>
            <div style={styles.inputWrapper}>
              <Calendar size={16} color="#64748b" style={{marginRight: 8}}/>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <InvestorGuidance date={selectedDate} />
        <RegimeTimeline selectedDate={selectedDate} />
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2025 Market Regime Analytics • Internal Use Only</p>
      </footer>
    </div>
  );
}

// Inline styles
const styles = {
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '20px 0',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '20px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px',
  },
  brandName: {
    fontSize: '20px',
    color: 'var(--primary)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  dateControl: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    marginBottom: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
  },
  main: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '40px',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '40px 0',
    color: 'var(--text-muted)',
    fontSize: '13px',
    borderTop: '1px solid #e2e8f0',
    marginTop: '40px',
  },
};
