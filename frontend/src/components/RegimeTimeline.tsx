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
    <div style={{ marginTop: "30px" }}>
      <h3>📈 Market Regime Timeline</h3>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <XAxis dataKey="date" hide />
          <Tooltip />

          <Line
            type="stepAfter"
            dataKey="regime"
            stroke="#aaa"
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

      <div style={{ fontSize: "13px", marginTop: "6px" }}>
        <span style={{ color: "#2e7d32" }}>🟢 Stable</span> |{" "}
        <span style={{ color: "#f9a825" }}>🟡 Uncertain</span> |{" "}
        <span style={{ color: "#c62828" }}>🔴 Crisis</span>
      </div>
    </div>
  );
}
