import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from joblib import dump
from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))

from features.urlfeatures import extract_url_features, FEATURE_NAMES

data_path = BASE_DIR / "data" / "urls.csv"
df = pd.read_csv(data_path)

X = np.vstack(df["url"].apply(extract_url_features).values)
y = df["label"].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("URL model accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

dump(model, BASE_DIR / "models" / "url_model.pkl")
print("Saved URL model")
