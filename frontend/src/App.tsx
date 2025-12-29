import InvestorGuidance from "./components/InvestorGuidance";
import RegimeTimeline from "./components/RegimeTimeline";

/* -------------------------------
   App Layout
-------------------------------- */

export default function App() {
  return (
    <div style={appShell}>
      {/* Header */}
      <header style={header}>
        <h1 style={title}>Investor Intelligence Dashboard</h1>
        <p style={subtitle}>
          Regime-aware market insights for long-term investors
        </p>
      </header>

      {/* Main Content */}
      <main style={mainContent}>
        <section style={section}>
          <InvestorGuidance />
        </section>

        <section style={section}>
          <RegimeTimeline />
        </section>
      </main>

      {/* Footer */}
      <footer style={footer}>
        © {new Date().getFullYear()} Market Regime Analytics
      </footer>
    </div>
  );
}

/* -------------------------------
   Styles
-------------------------------- */

const appShell: React.CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  background: "#f4f6f8", // clean professional bg
  display: "flex",
  flexDirection: "column",
};

const header: React.CSSProperties = {
  padding: "24px 32px",
  background: "#ffffff",
  borderBottom: "1px solid #e0e0e0",
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: "26px",
  fontWeight: 600,
};

const subtitle: React.CSSProperties = {
  marginTop: "6px",
  color: "#666",
};

const mainContent: React.CSSProperties = {
  width: "100%",
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "32px",
};

const section: React.CSSProperties = {
  marginBottom: "40px",
};

const footer: React.CSSProperties = {
  marginTop: "auto",
  padding: "16px",
  textAlign: "center",
  fontSize: "13px",
  color: "#777",
};
