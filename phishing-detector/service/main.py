from fastapi import FastAPI
from pydantic import BaseModel
from joblib import load
from pathlib import Path
import sys
import uvicorn

# ---------- PATH SETUP ----------
BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from features.urlfeatures import extract_url_features

# ---------- LOAD MODELS ----------
URL_MODEL_PATH = BASE_DIR / "models" / "url_model.pkl"
TEXT_MODEL_PATH = BASE_DIR / "models" / "text_model.pkl"
VEC_PATH = BASE_DIR / "models" / "text_vectorizer.pkl"

url_model = load(URL_MODEL_PATH)
text_model = load(TEXT_MODEL_PATH)
vectorizer = load(VEC_PATH)

# ---------- FASTAPI ----------
app = FastAPI(title="Phishing Detection API", version="2.0")


# ---------- REQUEST SCHEMAS ----------
class URLRequest(BaseModel):
    url: str


class TextRequest(BaseModel):
    text: str


# ---------- URL EXPLANATION ----------
def explain_url(url: str):
    reasons = []
    lower_url = url.lower()

    if not url.startswith("https://"):
        reasons.append("URL does not use HTTPS")

    if any(keyword in lower_url for keyword in ["login", "verify", "update", "secure", "account"]):
        reasons.append("Contains suspicious keywords related to sensitive actions")

    if any(char.isdigit() for char in url) and url.count(".") > 3:
        reasons.append("URL contains numeric or complex domain structure")

    if "@" in url:
        reasons.append("URL contains '@' symbol which is commonly used in phishing")

    if len(url) > 75:
        reasons.append("URL length is unusually long")

    if not reasons:
        reasons.append("URL structure matches known phishing patterns from training data")

    return reasons


# ---------- TEXT EXPLANATION ----------
def explain_text(text: str):
    reasons = []
    lower = text.lower()

    if "urgent" in lower or "immediately" in lower or "within" in lower:
        reasons.append("Contains urgency-based language")

    if "verify" in lower or "update" in lower:
        reasons.append("Requests account verification")

    if "password" in lower or "otp" in lower or "pin" in lower:
        reasons.append("Asks for sensitive information")

    if not reasons:
        reasons.append("Text pattern similar to legitimate messages")

    return reasons


# ---------- URL API ----------
@app.post("/check_url")
def check_url(req: URLRequest):
    features = extract_url_features(req.url)
    prediction = url_model.predict([features])[0]

    return {
        "url": req.url,
        "prediction": "phishing" if prediction == 1 else "legitimate",
        "explanation": explain_url(req.url)
    }


# ---------- TEXT API ----------
@app.post("/check_text")
def check_text(req: TextRequest):
    vec = vectorizer.transform([req.text])
    prediction = text_model.predict(vec)[0]

    return {
        "text": req.text,
        "prediction": "phishing" if prediction == 1 else "legitimate",
        "explanation": explain_text(req.text)
    }


# ---------- RUN SERVER ----------
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
