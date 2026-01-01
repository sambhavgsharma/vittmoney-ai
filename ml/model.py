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

# Lazy load classifier - only loads when needed
_classifier = None

def get_classifier():
    """Lazily load the zero-shot classifier on first use"""
    global _classifier
    if _classifier is None:
        print("Loading ML model (first request)...")
        print("ℹ️  Using distilbert-base-uncased-mnli (67M params, ~0.5-1s per request)")
        print("   This is 6x faster than bart-large-mnli (400M params, 3-5s)")
        
        # Use lightweight DistilBERT instead of BART
        # facebook/bart-large-mnli: 400M params, 3-5 seconds per request
        # typeform/distilbert-base-uncased-mnli: 67M params, 0.5-1 second per request
        _classifier = pipeline(
            "zero-shot-classification",
            model="typeform/distilbert-base-uncased-mnli",
            device=-1  # Use CPU (device=0 for GPU if available)
        )
        print("✅ ML model loaded and ready!")
    return _classifier

def classify_expense(text: str):
    """Classify expense with error handling"""
    try:
        classifier = get_classifier()
        result = classifier(text, LABELS)
        label = result["labels"][0]
        confidence = float(result["scores"][0])
        return label, confidence
    except Exception as e:
        print(f"❌ Classification error for '{text}': {e}")
        # Fallback to "Other" if classification fails
        return "Other", 0.0

