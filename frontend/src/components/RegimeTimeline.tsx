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
  regime: number;
};

/* -------------------------------
   Helpers
-------------------------------- */

const regimeColor = (r: number) => {
  if (r === 0) return "#2e7d32"; // Stable
  if (r === 1) return "#f9a825"; // Uncertain
  return "#c62828"; // Crisis
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
      .catch((err) => {
        console.error(err);
        setError("Unable to load regime timeline");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading regime timeline…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      style={{
        marginTop: 30,
        padding: 20,
        background: "#ffffff",
        borderRadius: 12,
      }}
    >
      <h3 style={{ marginBottom: 10 }}>📈 Market Regime Timeline</h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <XAxis dataKey="date" hide />
          <YAxis domain={[0, 2]} hide />

          <Tooltip
            formatter={(value: number) =>
              value === 0
                ? "Stable"
                : value === 1
                ? "Uncertain"
                : "Crisis"
            }
          />

          <Line
            type="stepAfter"
            dataKey="regime"
            stroke="#333"
            strokeWidth={3}
            dot={({ cx, cy, payload }) => (
              <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={regimeColor(payload.regime)}
                stroke="#000"
                strokeWidth={0.5}
              />
            )}
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ fontSize: 13, marginTop: 10 }}>
        <span style={{ color: "#2e7d32" }}>🟢 Stable</span> |{" "}
        <span style={{ color: "#f9a825" }}>🟡 Uncertain</span> |{" "}
        <span style={{ color: "#c62828" }}>🔴 Crisis</span>
      </div>
    </div>
  );
}
