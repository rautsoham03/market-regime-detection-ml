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

const regimeLabel = (r: number) => {
  if (r === 0) return "Stable";
  if (r === 1) return "Uncertain";
  return "Crisis";
};

const regimeColor = (r: number) => {
  if (r === 0) return "#2e7d32"; // green
  if (r === 1) return "#f9a825"; // amber
  return "#c62828"; // red
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

  /* -------------------------------
     Render states
  -------------------------------- */

  if (loading) {
    return <p style={{ marginTop: 30 }}>Loading market regime timeline…</p>;
  }

  if (error) {
    return (
      <p style={{ marginTop: 30, color: "red" }}>
        {error}
      </p>
    );
  }

  /* -------------------------------
     Main Render
  -------------------------------- */

  return (
    <div
      style={{
        marginTop: 40,
        padding: 24,
        background: "#ffffff",
        borderRadius: 14,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ marginBottom: 16 }}>
        📈 Market Regime Timeline
      </h3>

      {/* Chart Container */}
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" hide />
            <YAxis
              type="number"
              domain={[0, 2]}
              ticks={[0, 1, 2]}
              tickFormatter={(v) => regimeLabel(v)}
            />

            <Tooltip
              formatter={(value: number) => regimeLabel(value)}
              labelFormatter={(label) => `Date: ${label}`}
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
                  r={6}
                  fill={regimeColor(payload.regime)}
                  stroke="none"
                />
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ fontSize: 14, marginTop: 14 }}>
        <span style={{ color: "#2e7d32", marginRight: 12 }}>
          🟢 Stable
        </span>
        <span style={{ color: "#f9a825", marginRight: 12 }}>
          🟡 Uncertain
        </span>
        <span style={{ color: "#c62828" }}>
          🔴 Crisis
        </span>
      </div>
    </div>
  );
}
