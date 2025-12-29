import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { API_BASE } from "../config";

/* -------------------------------
   Types
-------------------------------- */

type RegimePoint = {
  date: string;
  regime: number; // 0 = Stable, 1 = Uncertain, 2 = Crisis
};

/* -------------------------------
   Helpers
-------------------------------- */

const regimeColor = (v: number) => {
  if (v === 0) return "#2e7d32";
  if (v === 1) return "#f9a825";
  return "#c62828";
};

const regimeLabelSafe = (v: unknown): string => {
  if (typeof v !== "number") return "";
  if (v === 0) return "Stable";
  if (v === 1) return "Uncertain";
  return "Crisis";
};

/* -------------------------------
   Component
-------------------------------- */

export default function RegimeTimeline() {
  const [data, setData] = useState<RegimePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/regime-timeline`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((rows: RegimePoint[]) => {
        setData(rows);
        setError(null);
      })
      .catch(() => setError("Unable to load regime timeline"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading market regime timeline…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <section style={sectionStyle}>
      <h2>📈 Market Regime Timeline</h2>

      {/* FIXED HEIGHT — REQUIRED */}
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis
              domain={[0, 2]}
              ticks={[0, 1, 2]}
              tickFormatter={(v) => regimeLabelSafe(v)}
            />

            <Tooltip
              formatter={(value) => regimeLabelSafe(value)}
            />

            <Line
              type="stepAfter"
              dataKey="regime"
              stroke="#333"
              strokeWidth={2}
              dot={(props) =>
                props.cx && props.cy ? (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={4}
                    fill={regimeColor(props.payload.regime)}
                  />
                ) : null
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={legendStyle}>
        <span style={{ color: "#2e7d32" }}>● Stable</span>
        <span style={{ color: "#f9a825" }}>● Uncertain</span>
        <span style={{ color: "#c62828" }}>● Crisis</span>
      </div>
    </section>
  );
}

/* -------------------------------
   Styles
-------------------------------- */

const sectionStyle: React.CSSProperties = {
  marginTop: "60px",
  padding: "40px",
  background: "#ffffff",
  borderRadius: "14px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const legendStyle: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  marginTop: "12px",
  fontSize: "14px",
};
