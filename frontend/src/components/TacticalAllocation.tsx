import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PieChart as PieIcon, Shield, TrendingUp, DollarSign } from "lucide-react";

export default function TacticalAllocation({ date }: { date: string }) {
  const [allocation, setAllocation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regime, setRegime] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/investor-guidance?date=${date}`)
      .then(res => res.json())
      .then(data => {
        setRegime(data.regime);
        // Map text logic to percentages for visualization
        const mapping = getRegimeAllocation(data.regime);
        setAllocation([
          { name: 'Equity', value: mapping.equity, color: '#2563eb' }, // Blue
          { name: 'Debt / Bonds', value: mapping.debt, color: '#10b981' }, // Green
          { name: 'Cash / Gold', value: mapping.cash, color: '#f59e0b' }, // Gold
        ]);
      })
      .finally(() => setLoading(false));
  }, [date]);

  // Helper to determine percentages based on Regime
  const getRegimeAllocation = (regimeLabel: string) => {
    if (regimeLabel.includes("Stable")) return { equity: 70, debt: 20, cash: 10 };
    if (regimeLabel.includes("Uncertain")) return { equity: 40, debt: 40, cash: 20 };
    return { equity: 10, debt: 50, cash: 40 }; // Crisis
  };

  if (loading) return <div style={styles.loading}>Calculating Optimal Mix...</div>;

  return (
    <div className="animate-fade-in delay-1" style={styles.container}>
      <div style={styles.header}>
        <PieIcon size={24} color="#2563eb" />
        <h2 style={styles.title}>Tactical Asset Allocation</h2>
      </div>
      <p style={styles.subtitle}>
        Recommended portfolio split for the <strong>{regime}</strong> regime.
      </p>

      <div style={styles.contentGrid}>
        {/* Chart Section */}
        <div style={styles.chartBox}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={allocation}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {allocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `${value}%`}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Details Section */}
        <div style={styles.detailsBox}>
          <h3 style={styles.detailsTitle}>Why this allocation?</h3>
          
          <div style={styles.detailItem}>
            <TrendingUp size={18} color="#2563eb" style={{marginTop: 4}} />
            <div>
              <span style={styles.label}>Equity ({allocation[0].value}%)</span>
              <p style={styles.desc}>
                {regime.includes("Stable") ? "Aggressive growth focus." : "Reduced to minimize drawdown risk."}
              </p>
            </div>
          </div>

          <div style={styles.detailItem}>
            <Shield size={18} color="#10b981" style={{marginTop: 4}} />
            <div>
              <span style={styles.label}>Debt ({allocation[1].value}%)</span>
              <p style={styles.desc}>Stability and income generation.</p>
            </div>
          </div>

          <div style={styles.detailItem}>
            <DollarSign size={18} color="#f59e0b" style={{marginTop: 4}} />
            <div>
              <span style={styles.label}>Cash ({allocation[2].value}%)</span>
              <p style={styles.desc}>Dry powder for opportunities.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  container: { background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  loading: { padding: '40px', textAlign: 'center', color: '#64748b' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  title: { fontSize: '20px', fontWeight: 700, margin: 0, color: '#0f172a' },
  subtitle: { color: '#64748b', marginBottom: '32px' },
  contentGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' },
  chartBox: { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  detailsBox: { display: 'flex', flexDirection: 'column', gap: '20px' },
  detailsTitle: { fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '10px' },
  detailItem: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  label: { fontWeight: 600, color: '#334155', fontSize: '15px' },
  desc: { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }
};
