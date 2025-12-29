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
# Load & Clean Data (CRITICAL FIXES FOR YOUR CSV)
# ----------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "nifty50_final_with_labels.csv"

# Load the CSV
df = pd.read_csv(DATA_PATH, index_col=0, parse_dates=True)

# FIX 1: Map complex CSV labels to simple Frontend labels
# This ensures the Green/Yellow/Red colors work on the chart
label_map = {
    "Stable / Bull Market": "Stable",
    "Uncertain / Transition": "Uncertain",
    "Crisis / High Volatility": "Crisis"
}
# Apply mapping if the labels match the CSV format
df['regime_label'] = df['regime_label'].replace(label_map)

# FIX 2: Generate 'close' price if missing (Using Cumulative Return proxy)
# Your CSV lacked a 'close' column, causing the empty graph.
if 'close' not in df.columns and 'cum_return' in df.columns:
    # Multiply by ~8500 (approx Nifty start in 2015) to look like a price index
    df['close'] = df['cum_return'] * 8500 

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
    if date not in df.index:
        date = df.index[df.index.get_loc(date, method="nearest")]

    row = df.loc[date]

    historical_stats = {
        "avg_return": float(df["log_return"].mean()),
        "volatility": float(df["log_return"].std()),
        "max_drawdown": float(df["drawdown"].min()),
    }

    # Ensure we handle the potentially renamed labels or original ones safely
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
    # Now that we guaranteed 'close' exists, this will work
    timeline_df = (
        df.reset_index()
        .rename(columns={"index": "date"})
    )
    
    # Handle case where reset_index creates a column named "Price" instead of "date"
    if "date" not in timeline_df.columns:
        # Check if the index name was "Price"
        if "Price" in timeline_df.columns:
             timeline_df = timeline_df.rename(columns={"Price": "date"})
        else:
             # Fallback: rename the first column if it looks like a date
             timeline_df.rename(columns={timeline_df.columns[0]: "date"}, inplace=True)

    # Select only what we need
    final_df = timeline_df[["date", "close", "regime_label"]].tail(300)
    
    # Convert to standard types for JSON
    final_df["date"] = final_df["date"].astype(str)
    final_df["close"] = final_df["close"].astype(float)

    return final_df.to_dict(orient="records")
