import { useState } from "react";
import html2pdf from "html2pdf.js";
import { API_BASE } from "../config";
import RegimeTimeline from "./RegimeTimeline";

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
   Regime Theme Helper
-------------------------------- */

const getRegimeTheme = (regime: string) => {
  if (regime.includes("Stable"))
    return { bg: "#e8f5e9", border: "#2e7d32", emoji: "🟢" };
  if (regime.includes("Uncertain"))
    return { bg: "#fff8e1", border: "#f9a825", emoji: "🟡" };
  if (regime.includes("Crisis"))
    return { bg: "#fdecea", border: "#c62828", emoji: "🔴" };
  return { bg: "#f5f5f5", border: "#999", emoji: "ℹ️" };
};

/* -------------------------------
   Component
-------------------------------- */

export default function InvestorGuidance() {
  const [date, setDate] = useState("");
  const [data, setData] = useState<GuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGuidance = async (selectedDate: string) => {
    if (!selectedDate) return;

    setLoading(true);
    const res = await fetch(
      `${API_BASE}/investor-guidance?date=${selectedDate}`
    );
    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  const exportPDF = () => {
    const element = document.getElementById("guidance-card");
    if (!element) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: `Investor_Guidance_${date}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ marginBottom: 20 }}>📊 Investor Intelligence Dashboard</h2>

      {/* Date Picker */}
      <div style={{ marginBottom: 15 }}>
        <strong>Select Date:</strong>{" "}
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            fetchGuidance(e.target.value);
          }}
        />
      </div>

      {loading && <p>Analyzing market regime…</p>}

      {data && (() => {
        const theme = getRegimeTheme(data.regime);

        return (
          <>
            <button onClick={exportPDF} style={exportBtnStyle}>
              📄 Export Investor Report (PDF)
            </button>

            {/* Guidance Card */}
            <div
              id="guidance-card"
              style={{
                background: theme.bg,
                border: `2px solid ${theme.border}`,
                borderRadius: 12,
                padding: 24,
                marginTop: 20,
              }}
            >
              <h3>
                {theme.emoji} Market Regime: {data.regime}
              </h3>

              <p>
                <strong>Active Since:</strong> {data.start_date}
                <br />
                <strong>Duration:</strong> {data.duration_days} trading days
              </p>

              <h4>📊 Market Metrics</h4>
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
              <ul>{data.investment_avenues.map((i, idx) => <li key={idx}>{i}</li>)}</ul>

              <h4>🛡 Risk Focus</h4>
              <p>{data.risk_focus}</p>
            </div>
          </>
        );
      })()}

      {/* Divider */}
      <hr style={{ margin: "40px 0" }} />

      {/* Timeline Section */}
      <RegimeTimeline />
    </div>
  );
}

/* -------------------------------
   Styles
-------------------------------- */

const pageStyle: React.CSSProperties = {
  padding: "30px",
  maxWidth: "900px",
  margin: "0 auto",
  background: "#fafafa",
  color: "#111",
};

const exportBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  background: "#1976d2",
  color: "#fff",
};
