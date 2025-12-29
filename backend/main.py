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
# Smart Path Finder
# ----------------------------------

def find_working_data_dir(anchor_filename):
    base_dir = Path(__file__).resolve().parent
    candidate_dirs = [
        base_dir / "data",              
        base_dir.parent / "data",       
        Path("data"),                   
        base_dir                        
    ]
    for d in candidate_dirs:
        if (d / anchor_filename).exists():
            print(f"✅ Data Directory Located: {d}")
            return d
    return None

# ----------------------------------
# Load Data
# ----------------------------------

data_dir = find_working_data_dir("nifty50_final_with_labels.csv")
main_csv_path = None
quotes_csv_path = None

if data_dir:
    main_csv_path = data_dir / "nifty50_final_with_labels.csv"
    quotes_csv_path = data_dir / "Investors.csv"
    if not quotes_csv_path.exists():
        for f in os.listdir(data_dir):
            if f.lower() == "investors.csv":
                quotes_csv_path = data_dir / f
                break

if main_csv_path and main_csv_path.exists():
    df = pd.read_csv(main_csv_path, index_col=0, parse_dates=True)
    
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

# Load Quotes
quotes_data = []
if quotes_csv_path and quotes_csv_path.exists():
    try:
        quotes_df = pd.read_csv(quotes_csv_path, encoding='utf-8')
    except UnicodeDecodeError:
        try:
            quotes_df = pd.read_csv(quotes_csv_path, encoding='cp1252')
        except:
            quotes_df = pd.DataFrame()
            
    if not quotes_df.empty:
        quotes_data = quotes_df.to_dict(orient="records")

if not quotes_data:
    quotes_data = [{"name": "Market Wisdom", "quote": "Patience is key.", "url": ""}]


# ----------------------------------
# Helpers: Risk Logic
# ----------------------------------

def calculate_risk_metrics(row, lookback_window=5):
    vol_20 = row.get('vol_20', 0.01)
    vol_60 = row.get('vol_60', 0.01)
    
    vol_ratio = vol_20 / vol_60 if vol_60 > 0 else 1.0
    
    # Smoothed sensitivity
    prob_score = np.interp(vol_ratio, [1.1, 1.6, 2.5], [10, 50, 95])
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
    return random.choice(quotes_data)

@app.get("/investor-guidance")
def investor_guidance(
    date: str,
    persona: str = Query("Balanced", enum=["Conservative", "Balanced", "Aggressive"])
):
    if df.empty: return {"error": "Data not loaded"}

    date_obj = pd.to_datetime(date)
    if date_obj not in df.index:
        date_obj = df.index[df.index.get_loc(date_obj, method="nearest")]

    row = df.loc[date_obj]
    row.name = date_obj 

    # --- NEW: CALCULATE REGIME-SPECIFIC PERFORMANCE ---
    # We filter data to isolate ONLY the current regime block up to the selected date.
    block_id = row['regime_block']
    
    # 1. Get all days belonging to this specific regime block
    block_data = df[df['regime_block'] == block_id]
    
    # 2. Slice it: Start of regime -> Selected Date
    # This prevents "looking into the future" for the metrics
    regime_slice = block_data[block_data.index <= date_obj]
    
    if len(regime_slice) > 0:
        start_price = regime_slice.iloc[0]['close']
        current_price = row['close']
        
        # A. Regime Return (Absolute % change since regime start)
        regime_return = (current_price / start_price) - 1
        
        # B. Regime Volatility (Realized volatility during this period)
        if len(regime_slice) > 5:
            regime_vol = regime_slice['log_return'].std() * np.sqrt(252)
        else:
            regime_vol = row['vol_20'] # Fallback for new regimes
            
        # C. Regime Drawdown (Max loss encountered during this period)
        # We calculate "Drawdown from Peak" within this specific slice
        slice_prices = regime_slice['close']
        running_max = slice_prices.cummax()
        slice_drawdowns = (slice_prices / running_max) - 1
        regime_drawdown = slice_drawdowns.min()
        
    else:
        # Fallback (should theoretically not happen)
        regime_return = 0.0
        regime_vol = row['vol_20']
        regime_drawdown = 0.0

    # --------------------------------------------------

    ew_prob, recent_change = calculate_risk_metrics(row)

    historical_stats = {
        "avg_return": float(df["log_return"].mean()),
        "volatility": float(df["log_return"].std()),
        "max_drawdown": float(df["drawdown"].min()),
    }

    response = regime_investor_guidance_json(
        regime_label=row["regime_label"],
        avg_return=float(regime_return),    # <--- SENDING REGIME RETURN
        volatility=float(regime_vol),       # <--- SENDING REGIME VOL
        max_drawdown=float(regime_drawdown),# <--- SENDING REGIME DRAWDOWN
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
    
    if "date" not in timeline_df.columns or "close" not in timeline_df.columns:
        return []

    final_df = timeline_df[["date", "close", "regime_label"]].tail(300)
    final_df["date"] = final_df["date"].astype(str)
    final_df["close"] = final_df["close"].astype(float)
    return final_df.to_dict(orient="records")
