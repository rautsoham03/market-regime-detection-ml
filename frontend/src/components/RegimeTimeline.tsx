import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { API_BASE } from "../config";

/* -------------------------------
   Types
-------------------------------- */

type RegimePoint = {
  date: string;
  regime: number; // 0 Stable | 1 Uncertain | 2 Crisis
};

/* -------------------------------
   Helpers
-------------------------------- */

const regimeColor = (r: number) => {
  if (r === 0) return "#2e7d32";
  if (r === 1) return "#f9a825";
  return "#c62828";
};

const regimeLabel = (r: number) => {
  if (r === 0) return "Stable";
  if (r === 1) return "Uncertain";
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
        if (!res.ok) throw new Error("Failed to fetch timeline");
        return res.json();
      })
      .then((rows: RegimePoint[]) => {
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
    <div
      style={{
        background: "#ffffff",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <h3 style={{ marginBottom: "12px" }}>📈 Market Regime Timeline</h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <XAxis dataKey="date" hide />
          <Tooltip
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value) => regimeLabel(Number(value))}
            contentStyle={{
              background: "#fff",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />

          <Line
            type="stepAfter"
            dataKey="regime"
            stroke="#555"
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

      <div style={{ fontSize: "13px", marginTop: "10px" }}>
        <span style={{ color: "#2e7d32" }}>🟢 Stable</span> |{" "}
        <span style={{ color: "#f9a825" }}>🟡 Uncertain</span> |{" "}
        <span style={{ color: "#c62828" }}>🔴 Crisis</span>
      </div>
    </div>
  );
}
