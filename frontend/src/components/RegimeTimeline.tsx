import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type RegimePoint = {
  date: string;
  regime: number;
};

type Props = {
  data: RegimePoint[];
};

/* Regime → Color mapping */
const regimeColor = (r: number) => {
  if (r === 0) return "#2e7d32"; // Stable
  if (r === 1) return "#f9a825"; // Uncertain
  return "#c62828"; // Crisis
};

export default function RegimeTimeline({ data }: Props) {
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
            stroke="#333"
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
