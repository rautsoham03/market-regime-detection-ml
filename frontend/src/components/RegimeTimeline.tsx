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

const regimeLabel = (value: unknown): string => {
  const v = Number(value);
  if (v === 0) return "Stable";
  if (v === 1) return "Uncertain";
  if (v === 2) return "Crisis";
  return "";
};

const regimeColor = (r: number) => {
  if (r === 0) return "#2e7d32";
  if (r === 1) return "#f9a825";
  return "#c62828";
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

  if (loading) return <p style={{ marginTop: 30 }}>Loading regime timeline…</p>;
  if (error) return <p style={{ marginTop: 30, color: "red" }}>{error}</p>;

  return (
    <div
      style={{
        marginTop: 40,
        padding: 24,
        background: "#ffffff",
        borderRadius: 14,
        width: "100%",
      }}
    >
      <h3 style={{ marginBottom: 16 }}>📈 Market Regime Timeline</h3>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" hide />

            <YAxis
              domain={[0, 2]}
              ticks={[0, 1, 2]}
              tickFormatter={(value) => regimeLabel(value)}
            />

            <Tooltip
              formatter={(value) => regimeLabel(value)}
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

      <div style={{ fontSize: 14, marginTop: 14 }}>
        <span style={{ color: "#2e7d32", marginRight: 12 }}>🟢 Stable</span>
        <span style={{ color: "#f9a825", marginRight: 12 }}>🟡 Uncertain</span>
        <span style={{ color: "#c62828" }}>🔴 Crisis</span>
      </div>
    </div>
  );
}
