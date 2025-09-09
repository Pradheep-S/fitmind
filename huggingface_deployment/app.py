"""
FastAPI application for BERT text classification model.
This API provides a single endpoint for text classification using a pre-trained BERT model.
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="BERT Text Classification API",
    description="API for text classification using a pre-trained BERT model",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and tokenizer
model = None
tokenizer = None
device = None

# Request/Response models
class TextInput(BaseModel):
    text: str = Field(..., description="Text to classify", min_length=1, max_length=512)

class PredictionResponse(BaseModel):
    predicted_class: str
    confidence: float
    probabilities: Dict[str, float]

# Model configuration
MODEL_PATH = "."  # Current directory where model files are located
MAX_LENGTH = 512  # Maximum sequence length for BERT


def load_model_and_tokenizer():
    """Load the BERT model and tokenizer from local files."""
    global model, tokenizer, device
    
    try:
        # Set device
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {device}")
        
        # Check if model files exist
        required_files = [
            "config.json",
            "model.safetensors",
            "tokenizer_config.json",
            "vocab.txt",
            "special_tokens_map.json"
        ]
        
        for file in required_files:
            if not Path(MODEL_PATH, file).exists():
                raise FileNotFoundError(f"Required model file not found: {file}")
        
        # Load tokenizer
        logger.info("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        
        # Load model
        logger.info("Loading model...")
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
        model.to(device)
        model.eval()  # Set to evaluation mode
        
        logger.info("Model and tokenizer loaded successfully!")
        
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise RuntimeError(f"Failed to load model: {str(e)}")


def get_class_labels():
    """Get class labels from the model configuration."""
    if model is None:
        return None
    
    # Try to get labels from config
    if hasattr(model.config, 'id2label'):
        return model.config.id2label
    else:
        # Default to numeric labels if no label mapping is available
        num_labels = model.config.num_labels
        return {i: f"Class_{i}" for i in range(num_labels)}


@app.on_event("startup")
async def startup_event():
    """Load model and tokenizer on startup."""
    load_model_and_tokenizer()


@app.get("/")
async def root():
    """Root endpoint providing API information."""
    return {
        "message": "BERT Text Classification API",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "tokenizer_loaded": tokenizer is not None,
        "device": str(device) if device else None
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict_text(input_data: TextInput) -> PredictionResponse:
    """
    Predict the class of the input text using the BERT model.
    
    Args:
        input_data: TextInput object containing the text to classify
        
    Returns:
        PredictionResponse containing predicted class, confidence, and probabilities
    """
    if model is None or tokenizer is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please check server logs."
        )
    
    try:
        # Tokenize input text
        inputs = tokenizer(
            input_data.text,
            add_special_tokens=True,
            max_length=MAX_LENGTH,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        # Move inputs to device
        inputs = {key: value.to(device) for key, value in inputs.items()}
        
        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            
            # Apply softmax to get probabilities
            probabilities = torch.softmax(logits, dim=-1)
            
            # Get predicted class
            predicted_class_id = torch.argmax(probabilities, dim=-1).item()
            confidence = probabilities[0][predicted_class_id].item()
        
        # Get class labels
        class_labels = get_class_labels()
        if class_labels:
            predicted_class = class_labels[predicted_class_id]
            prob_dict = {
                class_labels[i]: prob.item() 
                for i, prob in enumerate(probabilities[0])
            }
        else:
            predicted_class = str(predicted_class_id)
            prob_dict = {
                str(i): prob.item() 
                for i, prob in enumerate(probabilities[0])
            }
        
        return PredictionResponse(
            predicted_class=predicted_class,
            confidence=confidence,
            probabilities=prob_dict
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@app.get("/model-info")
async def get_model_info():
    """Get information about the loaded model."""
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded"
        )
    
    class_labels = get_class_labels()
    
    return {
        "model_name": getattr(model.config, 'name_or_path', 'Unknown'),
        "num_labels": model.config.num_labels,
        "max_position_embeddings": getattr(model.config, 'max_position_embeddings', 'Unknown'),
        "vocab_size": getattr(model.config, 'vocab_size', 'Unknown'),
        "class_labels": class_labels,
        "device": str(device)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False
    )
