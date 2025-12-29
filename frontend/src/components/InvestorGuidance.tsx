import { useState } from "react";
import html2pdf from "html2pdf.js";
import { motion } from "framer-motion";
import { API_BASE } from "../config";

/* ----------------------------------
   Types (MATCH BACKEND EXACTLY)
----------------------------------- */

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

/* ----------------------------------
   Regime Theme Helper
----------------------------------- */

const getRegimeTheme = (regime: string) => {
  if (regime.includes("Stable")) {
    return { bg: "#e8f5e9", border: "#2e7d32", emoji: "🟢" };
  }
  if (regime.includes("Uncertain")) {
    return { bg: "#fff8e1", border: "#f9a825", emoji: "🟡" };
  }
  if (regime.includes("Crisis")) {
    return { bg: "#fdecea", border: "#c62828", emoji: "🔴" };
  }
  return { bg: "#f5f5f5", border: "#999", emoji: "ℹ️" };
};

/* ----------------------------------
   Component
----------------------------------- */

export default function InvestorGuidance() {
  const [date, setDate] = useState("");
  const [data, setData] = useState<GuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuidance = async (selectedDate: string) => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE}/investor-guidance?date=${selectedDate}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch investor guidance");
      }

      const json: GuidanceResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Unable to load investor guidance");
      setData(null);
    } finally {
      setLoading(false);
    }
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

  /* ----------------------------------
     Render
  ----------------------------------- */

  return (
    <div style={pageStyle}>
      <h2>📊 Investor Intelligence Dashboard</h2>

      {/* Date Picker */}
      <label>
        <strong>Select Date:</strong>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            fetchGuidance(e.target.value);
          }}
          style={{ marginLeft: "10px" }}
        />
      </label>

      {loading && (
        <p style={{ marginTop: 15 }}>Analyzing market regime…</p>
      )}

      {error && (
        <p style={{ marginTop: 15, color: "red" }}>
          🚨 {error}
        </p>
      )}

      {data && (() => {
        const theme = getRegimeTheme(data.regime);

        return (
          <>
            {/* Export Button */}
            <button onClick={exportPDF} style={exportBtnStyle}>
              📄 Export Investor Report (PDF)
            </button>

            {/* Guidance Card */}
            <motion.div
              id="guidance-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                background: theme.bg,
                border: `2px solid ${theme.border}`,
                borderRadius: "12px",
                padding: "22px",
                marginTop: "20px",
                color: "#111",
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

              <h4>📈 Market Metrics</h4>
              <ul>
                <li>
                  Average Return:{" "}
                  {(data.metrics.average_return * 100).toFixed(2)}%
                </li>
                <li>
                  Volatility:{" "}
                  {(data.metrics.volatility * 100).toFixed(2)}%
                </li>
                <li>
                  Max Drawdown:{" "}
                  {(data.metrics.max_drawdown * 100).toFixed(2)}%
                </li>
              </ul>

              <h4>🎯 Investor Objective</h4>
              <p>{data.objective}</p>

              <h4>⚠️ Dominant Risk</h4>
              <p>{data.dominant_risk}</p>

              <h4>✅ Recommended Actions</h4>
              <ul>
                {data.actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>

              <h4>💼 Preferred Investment Avenues</h4>
              <ul>
                {data.investment_avenues.map((inv, i) => (
                  <li key={i}>{inv}</li>
                ))}
              </ul>

              <h4>🛡 Risk Focus</h4>
              <p>{data.risk_focus}</p>
            </motion.div>
          </>
        );
      })()}
    </div>
  );
}

/* ----------------------------------
   Styles
----------------------------------- */

const pageStyle: React.CSSProperties = {
  padding: "30px",
  maxWidth: "900px",
  margin: "0 auto",
  background: "#ffffff",
  color: "#111",
};

const exportBtnStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "10px 16px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  background: "#1976d2",
  color: "#fff",
};
