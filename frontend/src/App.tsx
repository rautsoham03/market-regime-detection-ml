import InvestorGuidance from "./components/InvestorGuidance";
import RegimeTimeline from "./components/RegimeTimeline";

export default function App() {
  return (
    <div style={appShell}>
      <div style={contentWrapper}>
        <InvestorGuidance />
        <RegimeTimeline />
      </div>
    </div>
  );
}

/* -------------------------------
   Layout styles
-------------------------------- */

const appShell: React.CSSProperties = {
  minHeight: "100vh",
  width: "100vw",
  background: "#121212", // dark dashboard bg
  display: "flex",
  justifyContent: "center",
};

const contentWrapper: React.CSSProperties = {
  width: "100%",
  maxWidth: "1200px",   // DESKTOP WIDTH
  padding: "30px",
  background: "#f9f9f9",
};
