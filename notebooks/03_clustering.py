import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

features = pd.read_csv(
    r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\data\nifty50_features.csv",
    index_col=0,
    parse_dates=True
)

#Infinite values arose due to logarithmic transformation of zero or missing trading volume.
np.isinf(features).sum()
features = features.replace([np.inf, -np.inf], np.nan)
features.dropna(inplace=True)

# Standardize Features

scaler = StandardScaler()
X_scaled = scaler.fit_transform(features)

# Choosing Number of Clusters (K)
inertia = []

for k in range(2, 8):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X_scaled)
    inertia.append(km.inertia_)
plt.figure(figsize=(6,4))
plt.plot(range(2,8), inertia, marker="o")
plt.xlabel("Number of Clusters (k)")
plt.ylabel("Inertia")
plt.title("Elbow Method")
plt.show()

for k in range(2, 6):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    print(f"k={k}, silhouette score={score:.3f}")
plt.figure(figsize=(6,4))
plt.plot(range(2,8), inertia, marker="o")
plt.xlabel("Number of Clusters (k)")
plt.ylabel("Inertia")
plt.title("Elbow Method")
plt.show()


#calculating the silhouette score
#higher the better separation
for k in range(2, 6):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    print(f"k={k}, silhouette score={score:.3f}")


# “Silhouette scores favor well-separated clusters, but financial regimes often overlap due to gradual transitions,
# so interpretability is prioritized over purely geometric separation.”
#Fit Final K-Means Model
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
features["regime"] = kmeans.fit_predict(X_scaled)

features.to_csv(
    r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\data\nifty50_with_regimes.csv"
)

#Inspect Cluster Centers
centers = pd.DataFrame(
    scaler.inverse_transform(kmeans.cluster_centers_),
    columns=features.columns[:-1]
)

print(centers)

