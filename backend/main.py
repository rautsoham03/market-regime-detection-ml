from fastapi import FastAPI, Query
import pandas as pd
import random
import numpy as np
from rag_advisor.advisor import regime_investor_guidance_json
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
import os

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
# Smart Path Finder (Piggyback Strategy)
# ----------------------------------

def find_working_data_dir(anchor_filename):
    """
    Finds the directory containing the 'anchor' file (the one we know works).
    Returns the Path to the directory.
    """
    base_dir = Path(__file__).resolve().parent
    
    # Places to look for the directory containing the anchor file
    candidate_dirs = [
        base_dir / "data",              # Standard: /backend/data/
        base_dir.parent / "data",       # Sibling: /root/data/
        Path("data"),                   # CWD: ./data/
        base_dir                        # Same folder as main.py (fallback)
    ]

    for d in candidate_dirs:
        candidate_path = d / anchor_filename
        if candidate_path.exists():
            print(f"✅ Data Directory Located: {d}")
            return d
            
    print(f"❌ Critical: Could not find anchor file '{anchor_filename}' anywhere.")
    return None

# ----------------------------------
# Load Data
# ----------------------------------

# 1. Locate the folder using the file we KNOW exists
data_dir = find_working_data_dir("nifty50_final_with_labels.csv")

main_csv_path = None
quotes_csv_path = None

if data_dir:
    # 2. Construct paths relative to that working folder
    main_csv_path = data_dir / "nifty50_final_with_labels.csv"
    quotes_csv_path = data_dir / "Investors.csv"

    # DEBUG: Check if Investors.csv exists, otherwise print folder contents
    if not quotes_csv_path.exists():
        print(f"⚠️ 'Investors.csv' not found in {data_dir}")
        print(f"📂 Folder contents: {os.listdir(data_dir)}") # THIS WILL SHOW YOU THE ACTUAL FILE NAMES
        # Attempt case-insensitive fix (e.g. investors.csv)
        for f in os.listdir(data_dir):
            if f.lower() == "investors.csv":
                quotes_csv_path = data_dir / f
                print(f"✅ Found case-mismatch file: {quotes_csv_path}")
                break

# 3. Load Main Data
if main_csv_path and main_csv_path.exists():
    df = pd.read_csv(main_csv_path, index_col=0, parse_dates=True)
    
    # Ensure 'close' column exists
    if 'close' not in df.columns:
        if 'cum_return' in df.columns:
            df['close'] = df['cum_return'] * 8500
        else:
            df['close'] = 10000

    label_map = {
        "Stable / Bull Market": "Stable",
        "Uncertain / Transition": "Uncertain",
        "Crisis / High Volatility": "Crisis"
    }
    df['regime_label'] = df['regime_label'].replace(label_map)
    df.sort_index(inplace=True)
else:
    print("CRITICAL ERROR: Main Data CSV could not be loaded.")
    df = pd.DataFrame()

# 4. Load Quotes Data
quotes_data = []
if quotes_csv_path and quotes_csv_path.exists():
    try:
        quotes_df = pd.read_csv(quotes_csv_path)
        quotes_data = quotes_df.to_dict(orient="records")
        print(f"✅ Loaded {len(quotes_data)} quotes.")
    except Exception as e:
        print(f"Error reading quotes: {e}")

# Fallback
if not quotes_data:
    quotes_data = [{"name": "Market Wisdom", "quote": "Patience is key.", "url": ""}]


# ----------------------------------
# Helper: Calculate Early Warning
# ----------------------------------
def calculate_risk_metrics(row, lookback_window=5):
    vol_20 = row.get('vol_20', 0.01)
    vol_60 = row.get('vol_60', 0.01)
    
    vol_ratio = vol_20 / vol_60 if vol_60 > 0 else 1.0
    
    prob_score = np.interp(vol_ratio, [0.8, 1.0, 1.5], [10, 40, 90])
    early_warning_prob = int(np.clip(prob_score, 0, 99))

    current_date_idx = df.index.get_loc(row.name)
    start_idx = max(0, current_date_idx - lookback_window)
    recent_slice = df.iloc[start_idx:current_date_idx+1]
    
    has_recent_change = False
    if 'regime_change' in recent_slice.columns:
        has_recent_change = bool(recent_slice['regime_change'].any())

    return early_warning_prob, has_recent_change


# ----------------------------------
# Endpoints
# ----------------------------------

@app.get("/")
def home():
    return {"status": "Backend running successfully"}

@app.get("/random-quote")
def get_random_quote():
    if not quotes_data:
        return {"name": "N/A", "quote": "Loading...", "url": ""}
    return random.choice(quotes_data)

@app.get("/investor-guidance")
def investor_guidance(
    date: str,
    persona: str = Query("Balanced", enum=["Conservative", "Balanced", "Aggressive"])
):
    if df.empty:
        return {"error": "Data not loaded"}

    date_obj = pd.to_datetime(date)
    if date_obj not in df.index:
        date_obj = df.index[df.index.get_loc(date_obj, method="nearest")]

    row = df.loc[date_obj]
    row.name = date_obj 

    ew_prob, recent_change = calculate_risk_metrics(row)

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

    response["early_warning_prob"] = ew_prob
    response["recent_regime_change"] = recent_change
    
    return response

@app.get("/regime-timeline")
def regime_timeline():
    if df.empty: return []

    timeline_df = df.reset_index()
    if "Price" in timeline_df.columns: timeline_df = timeline_df.rename(columns={"Price": "date"})
    elif "index" in timeline_df.columns: timeline_df = timeline_df.rename(columns={"index": "date"})
    
    final_df = timeline_df[["date", "close", "regime_label"]].tail(300)
    final_df["date"] = final_df["date"].astype(str)
    final_df["close"] = final_df["close"].astype(float)
    return final_df.to_dict(orient="records")
