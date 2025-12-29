from fastapi import FastAPI, Query
import pandas as pd
from rag_advisor.advisor import regime_investor_guidance_json
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

# ----------------------------------
# App initialization
# ----------------------------------

app = FastAPI(title="Regime-Aware Investor Guidance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------
# Load & Clean Data
# ----------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "nifty50_final_with_labels.csv"

# Load data
df = pd.read_csv(DATA_PATH, index_col=0, parse_dates=True)

# --- CRITICAL FIX 1: Generate 'close' price for the graph ---
# Your CSV has 'cum_return' but no 'close'. We proxy it so the graph draws a line.
if 'close' not in df.columns:
    if 'cum_return' in df.columns:
        # Multiply by 8500 (approx Nifty start) to look like a real price index
        df['close'] = df['cum_return'] * 8500
    else:
        # Fallback if both missing
        df['close'] = 10000

# --- CRITICAL FIX 2: Map Labels for Colors ---
# Frontend expects "Stable", "Uncertain", "Crisis". Your CSV has "Stable / Bull Market".
label_map = {
    "Stable / Bull Market": "Stable",
    "Uncertain / Transition": "Uncertain",
    "Crisis / High Volatility": "Crisis"
}
# Only replace if the long labels exist
df['regime_label'] = df['regime_label'].replace(label_map)

df.sort_index(inplace=True)

# ----------------------------------
# Endpoints
# ----------------------------------

@app.get("/")
def home():
    return {"status": "Backend running successfully"}

@app.get("/investor-guidance")
def investor_guidance(
    date: str,
    persona: str = Query("Balanced", enum=["Conservative", "Balanced", "Aggressive"])
):
    date = pd.to_datetime(date)
    
    # Handle nearest date if selected date is a weekend/holiday
    if date not in df.index:
        date = df.index[df.index.get_loc(date, method="nearest")]

    row = df.loc[date]

    historical_stats = {
        "avg_return": float(df["log_return"].mean()),
        "volatility": float(df["log_return"].std()),
        "max_drawdown": float(df["drawdown"].min()),
    }

    response = regime_investor_guidance_json(
        regime_label=row["regime_label"],
        avg_return=float(row["log_return"]),
        volatility=float(row["vol_20"]),
        max_drawdown=float(row["drawdown"]),
        regime_start_date=str(row["regime_start_date"]),
        regime_duration_days=int(row["regime_duration_days"]),
        persona=persona,
        historical_stats=historical_stats,
    )
    return response

@app.get("/regime-timeline")
def regime_timeline():
    # Reset index to turn the Date Index into a column
    timeline_df = df.reset_index()

    # --- CRITICAL FIX 3: Rename Index to 'date' ---
    # Your CSV index is named "Price", so reset_index() creates a column named "Price".
    # The frontend looks for "date".
    if "Price" in timeline_df.columns:
        timeline_df = timeline_df.rename(columns={"Price": "date"})
    elif "index" in timeline_df.columns:
        timeline_df = timeline_df.rename(columns={"index": "date"})
    
    # Select only necessary columns
    # We use 'close' (which we calculated above) and 'regime_label' (which we fixed above)
    final_df = timeline_df[["date", "close", "regime_label"]].tail(300)
    
    # formatting for JSON
    final_df["date"] = final_df["date"].astype(str)
    final_df["close"] = final_df["close"].astype(float)

    return final_df.to_dict(orient="records")
