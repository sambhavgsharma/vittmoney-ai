from transformers import pipeline

LABELS = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Health",
    "Entertainment",
    "Other"
]

# Load model once at startup (cached in memory)
print("Loading ML model... (this happens once on startup)")
print("ℹ️  Using distilbert-base-uncased-mnli (67M params, ~0.5-1s per request)")
print("   This is 6x faster than bart-large-mnli (400M params, 3-5s)")

# Use lightweight DistilBERT instead of BART
# facebook/bart-large-mnli: 400M params, 3-5 seconds per request
# typeform/distilbert-base-uncased-mnli: 67M params, 0.5-1 second per request
classifier = pipeline(
    "zero-shot-classification",
    model="typeform/distilbert-base-uncased-mnli",
    device=-1  # Use CPU (device=0 for GPU if available)
)
print("✅ ML model loaded and ready!")

def classify_expense(text: str):
    """Classify expense with error handling"""
    try:
        result = classifier(text, LABELS)
        label = result["labels"][0]
        confidence = float(result["scores"][0])
        return label, confidence
    except Exception as e:
        print(f"❌ Classification error for '{text}': {e}")
        # Fallback to "Other" if classification fails
        return "Other", 0.0

