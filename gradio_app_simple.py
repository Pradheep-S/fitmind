"""
Simple Gradio interface for BERT Text Classification
This version avoids FastAPI to prevent Pydantic conflicts.
"""

import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import json
from pathlib import Path

# Global variables for model and tokenizer
model = None
tokenizer = None
device = None

def load_model_and_tokenizer():
    """Load the BERT model and tokenizer from local files."""
    global model, tokenizer, device
    
    try:
        # Set device
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {device}")
        
        # Check if model files exist
        required_files = [
            "config.json",
            "model.safetensors", 
            "tokenizer_config.json",
            "vocab.txt",
            "special_tokens_map.json"
        ]
        
        for file in required_files:
            if not Path(file).exists():
                raise FileNotFoundError(f"Required model file not found: {file}")
        
        # Load tokenizer
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(".")
        
        # Load model
        print("Loading model...")
        model = AutoModelForSequenceClassification.from_pretrained(".")
        model.to(device)
        model.eval()
        
        print("Model and tokenizer loaded successfully!")
        return True
        
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        return False

def predict_text(text):
    """
    Predict the class of the input text using the BERT model.
    """
    try:
        if not text or not text.strip():
            return "Please enter some text to classify.", "", ""
        
        if model is None or tokenizer is None:
            return "Model not loaded. Please check the setup.", "", ""
        
        # Tokenize input text
        inputs = tokenizer(
            text,
            add_special_tokens=True,
            max_length=512,
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
        if hasattr(model.config, 'id2label'):
            class_labels = model.config.id2label
            predicted_class = class_labels[predicted_class_id]
            prob_dict = {
                class_labels[i]: f"{prob.item():.4f}" 
                for i, prob in enumerate(probabilities[0])
            }
        else:
            predicted_class = f"LABEL_{predicted_class_id}"
            prob_dict = {
                f"LABEL_{i}": f"{prob.item():.4f}" 
                for i, prob in enumerate(probabilities[0])
            }
        
        # Format results
        result = f"**Predicted Class:** {predicted_class}"
        confidence_text = f"**Confidence:** {confidence:.4f} ({confidence*100:.2f}%)"
        probabilities_text = "**All Probabilities:**\n" + "\n".join([f"- {k}: {v}" for k, v in prob_dict.items()])
        
        return result, confidence_text, probabilities_text
        
    except Exception as e:
        error_msg = f"Prediction failed: {str(e)}"
        print(f"Error in predict_text: {error_msg}")  # Log the error
        return error_msg, "", ""

def get_model_info():
    """Get information about the loaded model."""
    if model is None:
        return "Model not loaded"
    
    info = f"""
**Model Information:**
- Model Name: {getattr(model.config, 'name_or_path', 'BERT')}
- Number of Labels: {model.config.num_labels}
- Max Position Embeddings: {getattr(model.config, 'max_position_embeddings', 'Unknown')}
- Vocabulary Size: {getattr(model.config, 'vocab_size', 'Unknown')}
- Device: {str(device)}
"""
    
    if hasattr(model.config, 'id2label'):
        class_labels = model.config.id2label
        info += f"\n**Class Labels:**\n" + "\n".join([f"- {k}: {v}" for k, v in class_labels.items()])
    
    return info

# Load model on startup
print("Loading BERT model...")
model_loaded = load_model_and_tokenizer()

if not model_loaded:
    print("Failed to load model. Please check that all model files are present.")
else:
    print("Model loaded successfully!")

# Create Gradio interface
with gr.Blocks(title="BERT Text Classification", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🤖 BERT Text Classification")
    gr.Markdown("Enter text below to classify it using a pre-trained BERT model.")
    
    with gr.Tab("Text Classification"):
        with gr.Row():
            with gr.Column():
                text_input = gr.Textbox(
                    label="Enter text to classify",
                    placeholder="Type your text here...",
                    lines=3,
                    max_lines=10
                )
                classify_btn = gr.Button("Classify Text", variant="primary")
                
            with gr.Column():
                result_output = gr.Markdown(label="Prediction Result")
                confidence_output = gr.Markdown(label="Confidence")
                probabilities_output = gr.Markdown(label="All Probabilities")
        
        # Example inputs (without caching to avoid conflicts)
        gr.Examples(
            examples=[
                ["This movie is absolutely amazing! I loved every minute of it."],
                ["This product is terrible and I hate it."],
                ["The weather today is cloudy."],
                ["I'm feeling great today!"],
                ["This is the worst experience I've ever had."]
            ],
            inputs=text_input
        )
    
    with gr.Tab("Model Information"):
        model_info = gr.Markdown(value=get_model_info() if model_loaded else "Model not loaded")
        refresh_btn = gr.Button("Refresh Model Info")
        refresh_btn.click(fn=get_model_info, outputs=model_info)
    
    # Connect the classify button
    classify_btn.click(
        fn=predict_text,
        inputs=text_input,
        outputs=[result_output, confidence_output, probabilities_output]
    )

# Launch the interface
if __name__ == "__main__":
    print(f"Starting Gradio interface...")
    print(f"Model loaded: {model_loaded}")
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )