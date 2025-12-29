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

const regimeLabel = (r: number) => {
  if (r === 0) return "Stable";
  if (r === 1) return "Uncertain";
  return "Crisis";
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
        if (!res.ok) throw new Error("Failed to fetch timeline");
        return res.json();
      })
      .then((rows: RegimePoint[]) => {
        setData(rows);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load market regime timeline");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ marginTop: 20 }}>Loading market regime timeline…</p>;
  }

  if (error) {
    return <p style={{ marginTop: 20, color: "red" }}>{error}</p>;
  }

  if (!data.length) {
    return <p style={{ marginTop: 20 }}>No regime data available</p>;
  }

  return (
    <section style={card}>
      <h3 style={{ marginBottom: 10 }}>📈 Market Regime Timeline</h3>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" hide />
            <Tooltip
              formatter={(v: number) => regimeLabel(v)}
              labelFormatter={(l) => `Date: ${l}`}
            />
            <Line
              type="stepAfter"
              dataKey="regime"
              stroke="#444"
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

      <div style={{ marginTop: 8, fontSize: 13 }}>
        <span style={{ color: "#2e7d32" }}>● Stable</span>{" "}
        <span style={{ color: "#f9a825" }}>● Uncertain</span>{" "}
        <span style={{ color: "#c62828" }}>● Crisis</span>
      </div>
    </section>
  );
}

/* -------------------------------
   Styles
-------------------------------- */

const card: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "14px",
  padding: "24px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  marginTop: "40px",
};
