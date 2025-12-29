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

const regimeColor = (value: number) => {
  if (value === 0) return "#2e7d32";
  if (value === 1) return "#f9a825";
  return "#c62828";
};

const regimeLabel = (value: number) => {
  if (value === 0) return "Stable";
  if (value === 1) return "Uncertain";
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
        if (!res.ok) throw new Error("Failed to load timeline");
        return res.json();
      })
      .then((rows: RegimePoint[]) => {
        if (!rows || rows.length === 0) {
          throw new Error("No timeline data");
        }
        setData(rows);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load regime timeline");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading market regime timeline…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>📈 Market Regime Timeline</h2>

      {/* IMPORTANT: fixed height wrapper */}
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis
              type="number"
              domain={[0, 2]}
              ticks={[0, 1, 2]}
              tickFormatter={regimeLabel}
            />
            <Tooltip
              formatter={(v: number) => regimeLabel(v)}
              labelStyle={{ fontSize: 12 }}
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

      {/* Legend */}
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

const titleStyle: React.CSSProperties = {
  marginBottom: "20px",
};

const legendStyle: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  marginTop: "12px",
  fontSize: "14px",
};
