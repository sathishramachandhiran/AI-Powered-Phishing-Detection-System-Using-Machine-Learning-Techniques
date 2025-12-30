import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from joblib import dump
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "emails.csv"

df = pd.read_csv(DATA_PATH)

X = df["text"]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

vectorizer = TfidfVectorizer(stop_words="english")
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

model = LogisticRegression(max_iter=1000)
model.fit(X_train_vec, y_train)

preds = model.predict(X_test_vec)
print("Text model accuracy:", accuracy_score(y_test, preds))

dump(model, BASE_DIR / "models" / "text_model.pkl")
dump(vectorizer, BASE_DIR / "models" / "text_vectorizer.pkl")

print("Text phishing model trained successfully")
