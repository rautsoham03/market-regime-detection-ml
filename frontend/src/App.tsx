import { useState, useEffect } from 'react';
import InvestorGuidance from "./components/InvestorGuidance";
import RegimeTimeline from "./components/RegimeTimeline";
import LoadingOverlay from "./components/LoadingOverlay";
import './App.css'; 
import { Layout, Calendar } from 'lucide-react';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>("2024-11-21");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeDate, setActiveDate] = useState<string>("2024-11-21");

  // Handle date change with cinematic loading effect
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setIsLoading(true);

    // INCREASED DURATION: 4000ms = 4 seconds
    // This gives the user enough time to read the investor quote
    setTimeout(() => {
      setActiveDate(newDate);
      // Small buffer to ensure data is ready before fading out
      setTimeout(() => setIsLoading(false), 500); 
    }, 4000); 
  };

  // Initial load effect
  useEffect(() => {
    handleDateChange(selectedDate);
  }, []);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      
      {/* Cinematic Loading Overlay */}
      {isLoading && <LoadingOverlay />}

      {/* HEADER - Dark Theme */}
      <header className="header-dark">
        <div className="container header-content">
          <div>
            <div style={styles.logoRow}>
              {/* Icon color changed to bright blue for contrast */}
              <Layout size={24} color="#3b82f6" />
              <h1 className="brand-name-dark">Market Regime Analytics</h1>
            </div>
            <p className="subtitle-dark">Regime-aware market insights for long-term investors</p>
          </div>

          <div style={styles.dateControl}>
            <label className="date-label-dark">ANALYSIS DATE</label>
            <div className="input-wrapper-dark">
              {/* Icon color changed to light gray */}
              <Calendar size={16} color="#a3a3a3" style={{marginRight: 8}}/>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => handleDateChange(e.target.value)} 
                className="date-input-styled" 
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={styles.main}>
        {/* Only show content when not loading to prevent flickering */}
        <div className={!isLoading ? "animate-fade-in delay-1" : ""}>
          <InvestorGuidance date={activeDate} />
        </div>
        
        <div className={!isLoading ? "animate-fade-in delay-2" : ""}>
          <RegimeTimeline selectedDate={activeDate} />
        </div>
      </main>

      <footer style={styles.footer}>
        <p>© 2025 Market Regime Analytics • Internal Use Only</p>
      </footer>
    </div>
  );
}

const styles = {
  // Header styles moved to CSS classes for the dark theme
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' },
  dateControl: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end' },
  main: { margin: '40px auto', display: 'flex', flexDirection: 'column' as const, gap: '32px', paddingBottom: '60px' },
  footer: { textAlign: 'center' as const, padding: '40px 0', color: '#94a3b8', fontSize: '13px', borderTop: '1px solid #e2e8f0', width: '100%', backgroundColor: '#fff' },
};
