import pandas as pd
import numpy as np
import yfinance as yf

ticker = "^NSEI"  # NIFTY 50 index

df = yf.download(
    ticker,
    start="2015-01-01",
    end="2024-12-31",
    interval="1d"
)

print(df.head())
print(df.tail())
print(df.shape)

df = df[['Close', 'Volume']]
df.dropna(inplace=True)

df.to_csv(r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\data\nifty50_raw.csv")

#Quick Sanity Check Plot
import matplotlib.pyplot as plt
plt.figure(figsize=(12,5))
plt.plot(df.index, df['Close'])
plt.title("NIFTY 50 Index Price")
plt.xlabel("Date")
plt.ylabel("Index Level")
plt.show()
