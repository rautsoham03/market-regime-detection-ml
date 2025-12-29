import { useState, useEffect } from 'react';
import InvestorGuidance from "./components/InvestorGuidance";
import RegimeTimeline from "./components/RegimeTimeline";
import TacticalAllocation from "./components/TacticalAllocation";
import StrategyGuide from "./components/StrategyGuide"; // Import the new component
import LoadingOverlay from "./components/LoadingOverlay";
import './App.css'; 
import { Layout, Calendar, PieChart, BookOpen } from 'lucide-react';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>("2024-11-21");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeDate, setActiveDate] = useState<string>("2024-11-21");
  
  // Updated state to include 'strategy'
  const [currentView, setCurrentView] = useState<"dashboard" | "allocation" | "strategy">("dashboard");

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setIsLoading(true);
    setTimeout(() => {
      setActiveDate(newDate);
      setTimeout(() => setIsLoading(false), 500); 
    }, 4000); 
  };

  useEffect(() => { handleDateChange(selectedDate); }, []);

  return (
    <div style={{ width: '100%', position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {isLoading && <LoadingOverlay />}

      <header className="header-dark">
        <div className="container header-content">
          <div>
            <div style={styles.logoRow}>
              <Layout size={24} color="#3b82f6" />
              <h1 className="brand-name-dark">Market Regime Analytics</h1>
            </div>
            
            <nav className="nav-bar">
              <button 
                className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
              >
                <Layout size={16} /> Dashboard
              </button>
              <button 
                className={`nav-item ${currentView === 'allocation' ? 'active' : ''}`}
                onClick={() => setCurrentView('allocation')}
              >
                <PieChart size={16} /> Allocation Playbook
              </button>
              <button 
                className={`nav-item ${currentView === 'strategy' ? 'active' : ''}`}
                onClick={() => setCurrentView('strategy')}
              >
                <BookOpen size={16} /> Strategy Guide
              </button>
            </nav>
          </div>

          <div style={styles.dateControl}>
            <label className="date-label-dark">ANALYSIS DATE</label>
            <div className="input-wrapper-dark">
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
        
        {/* VIEW 1: DASHBOARD */}
        {currentView === 'dashboard' && (
          <>
            <div className={!isLoading ? "animate-fade-in delay-1" : ""}>
              <InvestorGuidance date={activeDate} />
            </div>
            <div className={!isLoading ? "animate-fade-in delay-2" : ""}>
              <RegimeTimeline selectedDate={activeDate} />
            </div>
          </>
        )}

        {/* VIEW 2: ALLOCATION */}
        {currentView === 'allocation' && (
          <div className={!isLoading ? "animate-fade-in delay-1" : ""}>
            <TacticalAllocation date={activeDate} />
          </div>
        )}

        {/* VIEW 3: STRATEGY GUIDE */}
        {currentView === 'strategy' && (
          <div className={!isLoading ? "animate-fade-in delay-1" : ""}>
            <StrategyGuide />
          </div>
        )}

      </main>

      <footer style={styles.footer}>
        <p>© 2025 Market Regime Analytics • Internal Use Only</p>
      </footer>
    </div>
  );
}

const styles = {
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  dateControl: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end' },
  main: { margin: '40px auto', display: 'flex', flexDirection: 'column' as const, gap: '32px', paddingBottom: '60px', width: '100%', flex: 1 },
  footer: { textAlign: 'center' as const, padding: '40px 0', color: '#94a3b8', fontSize: '13px', borderTop: '1px solid #e2e8f0', width: '100%', backgroundColor: '#fff', marginTop: 'auto' },
};
