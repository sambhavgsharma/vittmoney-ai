# Vittmoney AI - ML Service

> **Python-Based Embedding and Vector Service**
>
> FastAPI service providing text embeddings using Sentence Transformers for semantic search and AI-powered financial insights.

---

## ✨ Features

### Core Functionality
- **Text Embeddings**: Generate 384-dimensional embeddings using Sentence Transformers
- **Batch Processing**: Efficient batch embedding generation
- **Vector Operations**: Similarity search and vector mathematics
- **RESTful API**: Simple HTTP endpoints for integration
- **Health Checks**: Built-in monitoring and status endpoints

### Technical Excellence
- **Sentence Transformers**: all-MiniLM-L6-v2 model for fast, accurate embeddings
- **CPU Optimized**: Fast inference without GPU requirements
- **Stateless API**: Easy to scale horizontally
- **Error Handling**: Comprehensive error responses

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip or conda
- Virtual environment (recommended)

### Installation

```bash
# Navigate to ml directory
cd ml

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Service

**Development Mode**:
```bash
python app.py
```
- Service runs on `http://localhost:5000`
- Debug mode enabled
- Auto-reload on code changes

**Production Mode** (with Gunicorn):
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 📁 Project Structure

```
ml/
├── app.py                     # FastAPI application and routes
├── embeddings.py              # Embedding generation utilities
├── model.py                   # Model loading and management
├── vector_store.py            # Vector operations and search
├── requirements.txt           # Python dependencies
├── venv/                      # Virtual environment (created on install)
├── __pycache__/               # Python cache files
├── ml_service.log             # Service logs
└── README.md                  # This file
```

---

## 🔑 API Endpoints

### Health Check

#### GET `/health`
Check if the service is running and healthy.

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-29T10:30:00Z"
}
```

### Embeddings

#### POST `/embed`
Generate embeddings for a list of texts.

**Request**:
```bash
curl -X POST http://localhost:5000/embed \
  -H "Content-Type: application/json" \
  -d '{
    "texts": [
      "₹420 spent on Food at Zomato on 2025-12-29",
      "₹650 spent on Food at Swiggy on 2025-12-28",
      "₹300 spent on Transport at Uber on 2025-12-27"
    ]
  }'
```

**Response**:
```json
{
  "success": true,
  "embeddings": [
    [0.1234, 0.5678, ..., 0.9012],  # 384 dimensions
    [0.2345, 0.6789, ..., 0.0123],
    [0.3456, 0.7890, ..., 0.1234]
  ],
  "count": 3
}
```

### Model Information

#### GET `/model-info`
Get information about the loaded embedding model.

```bash
curl http://localhost:5000/model-info
```

Response:
```json
{
  "model_name": "sentence-transformers/all-MiniLM-L6-v2",
  "embedding_dimension": 384,
  "max_sequence_length": 256
}
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Python 3.8+** | Programming language |
| **FastAPI** | Web framework |
| **Sentence Transformers** | Embedding generation |
| **NumPy** | Numerical operations |
| **scikit-learn** | Vector operations (similarity) |
| **Uvicorn** | ASGI server |
| **Gunicorn** | Production server |

---

## 📦 Dependencies

### Core Dependencies
```
fastapi==0.104.0              # Web framework
uvicorn==0.24.0               # ASGI server
sentence-transformers==2.2.2  # Embedding model
numpy==1.24.3                 # Numerical operations
scikit-learn==1.3.0           # ML utilities
torch==2.0.0                  # Deep learning backend
```

Install all dependencies:
```bash
pip install -r requirements.txt
```

---

## 🧠 Embedding Model

### Model: all-MiniLM-L6-v2

**Characteristics**:
- **Dimensions**: 384
- **Model Size**: ~22MB
- **Speed**: ~1000 sentences/second on CPU
- **Language**: English
- **Training Data**: SNLI + MultiNLI datasets
- **Use Case**: Semantic similarity, clustering, retrieval

**Benefits**:
- Fast inference on CPU
- Good quality embeddings
- Lightweight model size
- No GPU required
- Suitable for e-commerce, finance, support tickets

### How Embeddings Work

Embeddings convert text to numerical vectors:
```
Text: "₹420 spent on Food at Zomato"
         ↓
Tokenization: ["₹", "420", "spent", "on", "Food", ...]
         ↓
Transformer Model Processing
         ↓
Output Vector: [0.1234, 0.5678, ..., 0.9012] (384 dimensions)
```

These vectors capture semantic meaning, so similar texts have similar embeddings:
- "Food expense at Zomato" ≈ "Food cost at Zomato delivery"
- Distance between vectors ∝ semantic difference

---

## 🔄 Integration with Backend

The ML service integrates with the Node.js backend for RAG (Retrieval-Augmented Generation):

### Flow Diagram
```
Backend Request
     ↓
POST /embed with facts list
     ↓
ML Service generates embeddings
     ↓
Embeddings stored in knowledge base
     ↓
Later: Query comes in
     ↓
POST /embed with user question
     ↓
Find top-5 similar facts using embeddings
     ↓
Send facts + query to Gemini LLM
     ↓
Get AI verdict
```

### Example Integration
```python
# Backend would call:
POST http://localhost:5000/embed
{
  "texts": [
    "₹420 spent on Food",
    "₹650 spent on Transport",
    "₹300 spent on Entertainment"
  ]
}

# Response:
{
  "embeddings": [
    [embedding_vector_1],
    [embedding_vector_2],
    [embedding_vector_3]
  ]
}
```

---

## 🚀 Performance Optimization

### Batch Processing
For maximum efficiency, send multiple texts at once:

```python
# Good - Batch processing
texts = [text1, text2, text3, ..., text100]
embeddings = embed(texts)  # Single request

# Avoid - Multiple requests
for text in texts:
    embedding = embed([text])  # 100 requests
```

### Caching Embeddings
Store and reuse embeddings for unchanged data:

```python
# Knowledge base structure
{
  "facts": ["fact1", "fact2", ...],
  "embeddings": [[...], [...], ...],
  "fact_hash": "abc123"  # For change detection
}
```

### Resource Usage
- **Memory**: ~500MB for model + inference buffers
- **CPU**: 1-2 cores typically sufficient
- **Disk**: ~50MB for model files
- **Latency**: ~10-50ms per batch of 10 texts

---

## 📊 Vector Similarity Search

Cosine similarity is used to find related texts:

```python
from sklearn.metrics.pairwise import cosine_similarity

# Query embedding
query_embedding = embed(["How can I save on food?"])

# Knowledge base embeddings
kb_embeddings = [
  embed(["₹420 spent on Food"]),
  embed(["₹650 spent on Transport"]),
  # ... more facts
]

# Calculate similarity (0 to 1, higher = more similar)
similarities = cosine_similarity(query_embedding, kb_embeddings)

# Get top 5
top_indices = similarities.argsort()[0][-5:]
top_facts = [facts[i] for i in top_indices]
```

---

## 🐛 Troubleshooting

### Model Download Fails
```bash
# Manual model download
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Or set cache directory
export HF_HOME=/custom/cache/path
python app.py
```

### Out of Memory
```bash
# Reduce batch size in code
# Or run on machine with more RAM
```

### Slow Embeddings
```bash
# Check CPU usage
htop

# Use smaller batches
# Or enable GPU if available
```

### Connection Refused
```bash
# Check port is not in use
lsof -i :5000

# Verify ML service is running
ps aux | grep app.py
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Model configuration
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384

# Server configuration
ML_SERVICE_HOST=0.0.0.0
ML_SERVICE_PORT=5000

# Hugging Face cache (optional)
HF_HOME=/path/to/huggingface/cache
```

### Changing the Embedding Model
Edit `model.py`:

```python
# Different model options
# sentence-transformers/paraphrase-MiniLM-L6-v2  (better quality)
# sentence-transformers/all-mpnet-base-v2         (slower, higher quality)
# sentence-transformers/distiluse-base-multilingual-cased-v2 (multilingual)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
```

---

## 📈 Scaling the Service

### Horizontal Scaling
```bash
# Run multiple instances with load balancer
gunicorn -w 4 -b 127.0.0.1:5000 app:app
gunicorn -w 4 -b 127.0.0.1:5001 app:app
gunicorn -w 4 -b 127.0.0.1:5002 app:app

# Use nginx as reverse proxy
```

### Vertical Scaling
```bash
# Use more worker processes
gunicorn -w 16 -b 0.0.0.0:5000 app:app
```

### Docker Deployment
```bash
# Build
docker build -t vittmoney-ml .

# Run
docker run -p 5000:5000 vittmoney-ml

# Scale with docker-compose
docker-compose up -d --scale ml=3
```

---

## 📝 Development Tips

### Local Testing
```bash
# Test embedding generation
python -c "
from embeddings import generate_embeddings
texts = ['Test text 1', 'Test text 2']
embeddings = generate_embeddings(texts)
print(f'Generated {len(embeddings)} embeddings')
print(f'Dimension: {len(embeddings[0])}')
"
```

### Adding Logging
```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug("Embedding text: %s", text)
logger.info("Generated %d embeddings", len(embeddings))
logger.error("Failed to embed: %s", error)
```

### Performance Profiling
```bash
# Profile with Python
python -m cProfile -s cumtime app.py

# Monitor with top
watch -n 1 'top -p $(pgrep -f app.py)'
```

---

## 🚀 Deployment Checklist

- [ ] Virtual environment activated
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Model downloaded and cached
- [ ] Environment variables configured
- [ ] Service tested locally
- [ ] Port 5000 accessible
- [ ] Logging configured
- [ ] Error handling tested
- [ ] Load testing completed
- [ ] Production server configured (Gunicorn)

---

## 🤝 Contributing

1. Maintain virtual environment
2. Install test dependencies
3. Follow PEP 8 style guide
4. Document changes
5. Test before committing

---

## 📚 References

- [Sentence Transformers](https://www.sbert.net/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Embedding Models Comparison](https://www.sbert.net/docs/pretrained_models.html)
- [Semantic Search Tutorial](https://www.sbert.net/examples/applications/semantic-search/README.html)

---

**Built with ❤️ using Python and Sentence Transformers**
