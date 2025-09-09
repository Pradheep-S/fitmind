# BERT Text Classification API

A FastAPI-based REST API for text classification using a pre-trained BERT model.

## Features

- 🚀 Fast inference with PyTorch and Transformers
- 📝 Automatic API documentation with Swagger/OpenAPI
- 🔧 Production-ready with proper error handling
- 📊 Model information and health check endpoints
- 🌐 CORS support for frontend integration

## Model Files Required

Place the following files in the project root directory:

```
├── app.py
├── requirements.txt
├── config.json
├── model.safetensors
├── tokenizer_config.json
├── special_tokens_map.json
└── vocab.txt
```

## Local Development

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the API

```bash
# Development server with auto-reload
uvicorn app:app --reload

# Production server
uvicorn app:app --host 0.0.0.0 --port 8000
```

### 3. Access the API

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Model Info**: http://localhost:8000/model-info

## API Endpoints

### POST /predict

Classify text using the BERT model.

**Request:**
```json
{
  "text": "Your text to classify here"
}
```

**Response:**
```json
{
  "predicted_class": "positive",
  "confidence": 0.8945,
  "probabilities": {
    "positive": 0.8945,
    "negative": 0.1055
  }
}
```

### GET /health

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "tokenizer_loaded": true,
  "device": "cpu"
}
```

### GET /model-info

Get information about the loaded model.

**Response:**
```json
{
  "model_name": "bert-base-uncased",
  "num_labels": 2,
  "max_position_embeddings": 512,
  "vocab_size": 30522,
  "class_labels": {
    "0": "negative",
    "1": "positive"
  },
  "device": "cpu"
}
```

## Deployment Options

### 1. Hugging Face Spaces

1. Create a new Space on [Hugging Face Spaces](https://huggingface.co/spaces)
2. Upload all files including model files
3. The `runtime.txt` file specifies Python 3.10
4. Hugging Face will automatically install dependencies and run the app

### 2. Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Use the included `Procfile` for deployment
4. Set environment variables if needed

### 3. Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect the Python app and deploy

### 4. Docker

Create a `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t bert-api .
docker run -p 8000:8000 bert-api
```

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Text classification
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "This movie is amazing!"}'
```

### Using Python

```python
import requests

# Test prediction
response = requests.post(
    "http://localhost:8000/predict",
    json={"text": "This is a great product!"}
)

result = response.json()
print(f"Predicted class: {result['predicted_class']}")
print(f"Confidence: {result['confidence']:.4f}")
```

## Environment Variables

- `PORT`: Server port (default: 8000)
- `CUDA_VISIBLE_DEVICES`: GPU device selection (optional)

## Performance Considerations

- The model is loaded once at startup for better performance
- GPU acceleration is automatically used if available
- Consider using model quantization for reduced memory usage
- Use a reverse proxy (nginx) for production deployments

## Troubleshooting

### Model Loading Issues

1. Ensure all required model files are present
2. Check file permissions
3. Verify model compatibility with transformers version

### Memory Issues

1. Consider using a smaller model variant
2. Reduce batch size or sequence length
3. Use CPU instead of GPU for smaller deployments

### CORS Issues

Update the CORS middleware in `app.py` with specific origins for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## License

This project is licensed under the MIT License.
