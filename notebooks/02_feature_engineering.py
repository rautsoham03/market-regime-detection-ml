import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

df = pd.read_csv(r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\data\nifty50_raw.csv", index_col=0, parse_dates=True)
df.head()

print(df.dtypes)

df["Close"] = pd.to_numeric(df["Close"], errors="coerce")
df["Volume"] = pd.to_numeric(df["Volume"], errors="coerce")


#removing any missing values
df.dropna(inplace=True)

#computing the log returns
df["log_return"] = np.log(df["Close"] / df["Close"].shift(1))

#computing Rolling Volatility using short term(one month) and long term(one quarter) time horizons
df["vol_20"] = df["log_return"].rolling(window=20).std()
df["vol_60"] = df["log_return"].rolling(window=60).std()

#Market regimes are not only about risk, but also direction
#Rolling mean return
df["mean_return_20"] = df["log_return"].rolling(window=20).mean()

#Moving Average Difference (Trend Strength)
df["ma_20"] = df["Close"].rolling(window=20).mean()
df["ma_60"] = df["Close"].rolling(window=60).mean()

df["ma_diff"] = df["ma_20"] - df["ma_60"]

# Interpretation:
# Positive → bullish trend
# Negative → bearish trend

#Volume often spikes during panic or euphoria.
df["volume_change"] = np.log(df["Volume"] / df["Volume"].shift(1))

# Drop rows with missing rolling values
df.dropna(inplace=True)

features = df[
    [
        "log_return",
        "vol_20",
        "vol_60",
        "mean_return_20",
        "ma_diff",
        "volume_change"
    ]
]

features.to_csv(r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\data\nifty50_features.csv")
print(features.describe())

features[["log_return", "vol_20", "vol_60"]].plot(subplots=True, figsize=(12,6))
plt.show()
