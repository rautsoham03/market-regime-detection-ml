import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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

const regimeColor = (r: number) => {
  if (r === 0) return "#2ecc71"; // green
  if (r === 1) return "#f1c40f"; // yellow
  return "#e74c3c"; // red
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
        if (!res.ok) throw new Error("Failed to fetch timeline");
        return res.json();
      })
      .then((rows: RegimePoint[]) => {
        setData(rows);
        setError(null);
      })
      .catch(() => {
        setError("Unable to load market regime timeline");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ marginTop: 20 }}>Loading market regime timeline…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      style={{
        marginTop: "40px",
        padding: "24px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      <h3 style={{ marginBottom: 16 }}>📈 Market Regime Timeline</h3>

      {/* IMPORTANT: height MUST be explicit */}
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" hide />
            <YAxis
              domain={[0, 2]}
              ticks={[0, 1, 2]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />

            <Line
              type="stepAfter"
              dataKey="regime"
              stroke="#34495e"
              strokeWidth={2}
              dot={({ cx, cy, payload }) => (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={regimeColor(payload.regime)}
                  stroke="none"
                />
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 12, fontSize: 13 }}>
        <span style={{ color: "#2ecc71", marginRight: 12 }}>🟢 Stable</span>
        <span style={{ color: "#f1c40f", marginRight: 12 }}>🟡 Uncertain</span>
        <span style={{ color: "#e74c3c" }}>🔴 Crisis</span>
      </div>
    </div>
  );
}

