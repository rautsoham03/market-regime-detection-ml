import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import { Quote, Loader2 } from "lucide-react";

type QuoteData = {
  name: string;
  quote: string;
  url: string;
};

export default function LoadingOverlay() {
  const [quote, setQuote] = useState<QuoteData | null>(null);

  useEffect(() => {
    // Fetch a random quote when the overlay mounts
    fetch(`${API_BASE}/random-quote`)
      .then(res => res.json())
      .then(data => setQuote(data))
      .catch(err => console.error("Failed to load quote", err));
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.contentContainer}>
        {/* Animated Spinner */}
        <Loader2 size={48} color="#2563eb" style={styles.spinner} />
        
        {quote ? (
          <div className="animate-fade-in delay-1" style={styles.quoteBox}>
            <Quote size={32} color="#cbd5e1" style={{ marginBottom: '20px', opacity: 0.5 }} />
            
            <h2 style={styles.quoteText}>“{quote.quote}”</h2>
            
            <div style={styles.authorBlock}>
              {quote.url && (
                <img src={quote.url} alt={quote.name} style={styles.authorImage} />
              )}
              <div style={{textAlign: 'left'}}>
                <p style={styles.authorName}>{quote.name}</p>
                <p style={styles.authorTitle}>Legendary Investor</p>
              </div>
            </div>
          </div>
        ) : (
          <p style={{color: 'white', marginTop: '20px'}}>Analyzing Market Data...</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    // Dark glassmorphism background (MIQ Style)
    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
    backdropFilter: 'blur(12px)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column' as const,
  },
  contentContainer: {
    maxWidth: '700px',
    padding: '40px',
    textAlign: 'center' as const,
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    marginBottom: '40px',
  },
  quoteBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: '28px',
    fontWeight: 300,
    fontStyle: 'italic',
    lineHeight: '1.5',
    marginBottom: '32px',
    color: '#f8fafc',
    fontFamily: 'Georgia, serif',
  },
  authorBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(255,255,255,0.08)',
    padding: '12px 24px',
    borderRadius: '50px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  authorImage: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '2px solid #2563eb',
  },
  authorName: {
    fontSize: '16px',
    fontWeight: 700,
    margin: 0,
    color: 'white',
  },
  authorTitle: {
    fontSize: '12px',
    color: '#cbd5e1',
    margin: 0,
  }
};
