import pandas as pd
import numpy as np

df = pd.read_csv(
    r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\data\nifty50_with_regimes.csv",
    index_col=0,
    parse_dates=True
)

# ================================
# Regime Summary Statistics
# ================================

regime_summary = df.groupby("regime").agg(
    avg_return=("log_return", "mean"),
    volatility=("log_return", "std"),
    avg_vol_20=("vol_20", "mean"),
    observations=("log_return", "count"),
)

regime_summary["risk_adjusted_return"] = (
    regime_summary["avg_return"] / regime_summary["volatility"]
)

regime_summary["time_fraction"] = (
    regime_summary["observations"] / regime_summary["observations"].sum()
)

print(regime_summary)

# ================================
# Regime Labels
# ================================

regime_labels = {
    0: "Stable / Bull Market",
    1: "Crisis / High Volatility",
    2: "Uncertain / Transition",
}

df["regime_label"] = df["regime"].map(regime_labels)

# ================================
# Drawdown Analysis
# ================================

df["cum_return"] = np.exp(df["log_return"].cumsum())
df["rolling_max"] = df["cum_return"].cummax()
df["drawdown"] = (df["cum_return"] - df["rolling_max"]) / df["rolling_max"]

print(df.groupby("regime")["drawdown"].min())

# ================================
# Regime Start & Duration
# ================================

# Detect regime change
df["regime_change"] = df["regime"] != df["regime"].shift(1)

# Assign regime blocks
df["regime_block"] = df["regime_change"].cumsum()

# Helper column for date
df["date"] = df.index

# Regime start date
df["regime_start_date"] = (
    df.groupby("regime_block")["date"]
      .transform("min")
)

# Regime duration in days
df["regime_duration_days"] = (
    df.index - df["regime_start_date"]
).dt.days + 1

# ================================
# Save Final Dataset
# ================================

df.to_csv(
    r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\data\nifty50_final_with_labels.csv"
)

print(df[[
    "regime_label",
    "regime_start_date",
    "regime_duration_days"
]].tail())
