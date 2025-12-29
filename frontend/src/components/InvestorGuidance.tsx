import { useState } from "react";
import html2pdf from "html2pdf.js";
import { API_BASE } from "../config";

/* -------------------------------
   Types
-------------------------------- */
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

/* -------------------------------
   Helpers
-------------------------------- */
const themeByRegime = (regime: string) => {
  if (regime.includes("Stable"))
    return { bg: "#e8f5e9", border: "#2ecc71", emoji: "🟢" };
  if (regime.includes("Uncertain"))
    return { bg: "#fff8e1", border: "#f1c40f", emoji: "🟡" };
  return { bg: "#fdecea", border: "#e74c3c", emoji: "🔴" };
};

/* -------------------------------
   Component
-------------------------------- */
export default function InvestorGuidance() {
  const [date, setDate] = useState("");
  const [data, setData] = useState<GuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGuidance = async (d: string) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/investor-guidance?date=${d}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  const exportPDF = () => {
    const el = document.getElementById("guidance-card");
    if (!el) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: `Investor_Guidance_${date}.pdf`,
        html2canvas: { scale: 2 },
      })
      .from(el)
      .save();
  };

  return (
    <section style={card}>
      <h2>📊 Investor Intelligence Dashboard</h2>

      <label>
        <strong>Select Date:</strong>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            fetchGuidance(e.target.value);
          }}
          style={{ marginLeft: 10 }}
        />
      </label>

      {loading && <p>Analyzing market regime…</p>}

      {data && (() => {
        const theme = themeByRegime(data.regime);
        return (
          <>
            <button onClick={exportPDF} style={exportBtn}>
              📄 Export Investor Report (PDF)
            </button>

            <div
              id="guidance-card"
              style={{
                marginTop: 20,
                padding: 24,
                background: theme.bg,
                border: `2px solid ${theme.border}`,
                borderRadius: 14,
              }}
            >
              <h3>
                {theme.emoji} Market Regime: {data.regime}
              </h3>

              <p>
                Active Since: <b>{data.start_date}</b> <br />
                Duration: <b>{data.duration_days}</b> trading days
              </p>

              <h4>📈 Market Metrics</h4>
              <ul>
                <li>Average Return: {(data.metrics.average_return * 100).toFixed(2)}%</li>
                <li>Volatility: {(data.metrics.volatility * 100).toFixed(2)}%</li>
                <li>Max Drawdown: {(data.metrics.max_drawdown * 100).toFixed(2)}%</li>
              </ul>

              <h4>🎯 Investor Objective</h4>
              <p>{data.objective}</p>

              <h4>⚠️ Dominant Risk</h4>
              <p>{data.dominant_risk}</p>

              <h4>✅ Recommended Actions</h4>
              <ul>{data.actions.map((a, i) => <li key={i}>{a}</li>)}</ul>

              <h4>💼 Preferred Investment Avenues</h4>
              <ul>{data.investment_avenues.map((i, k) => <li key={k}>{i}</li>)}</ul>

              <h4>🛡 Risk Focus</h4>
              <p>{data.risk_focus}</p>
            </div>
          </>
        );
      })()}
    </section>
  );
}

/* -------------------------------
   Styles
-------------------------------- */
const card: React.CSSProperties = {
  background: "#fff",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const exportBtn: React.CSSProperties = {
  marginTop: 15,
  padding: "10px 16px",
  background: "#1976d2",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};
