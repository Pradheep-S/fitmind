---
title: BERT Text Classification API
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.7.1
app_file: app.py
pinned: false
license: mit
---

---
title: BERT Text Classification
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.7.1
app_file: gradio_app.py
pinned: false
license: mit
---

# 🤖 BERT Text Classification

A Gradio interface for text classification using a pre-trained BERT model, deployed on Hugging Face Spaces.

## Features

- 🎯 **Interactive Web Interface** - Easy-to-use Gradio interface
- � **Fast BERT Inference** - Real-time text classification
- 📊 **Detailed Results** - Shows prediction, confidence, and all class probabilities
- 📝 **Example Texts** - Pre-loaded examples to test the model
- � **Model Information** - View model details and architecture
- 🌐 **API Access** - RESTful API endpoints for programmatic access

## How to Use

### Web Interface
1. **Enter your text** in the text box
2. **Click "Classify Text"** to get predictions
3. **View results** including predicted class, confidence score, and probabilities
4. **Try examples** by clicking on the provided sample texts

### API Access
You can also use this Space programmatically via API:

```bash
curl -X POST "https://your-space-name.hf.space/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "This is amazing!"}'
```

**Response:**
```json
{
  "predicted_class": "LABEL_1",
  "confidence": 0.8945,
  "probabilities": {
    "LABEL_0": 0.1055,
    "LABEL_1": 0.8945
  }
}
```

## Model Details

- **Architecture**: BERT-base
- **Classes**: 2 (Binary Classification)
- **Max Tokens**: 512
- **Vocabulary Size**: 30,522
- **Device**: CPU (Hugging Face Spaces)

## Example Classifications

- **Positive**: "This movie is absolutely amazing!" → LABEL_1 (99.67%)
- **Negative**: "This product is terrible!" → LABEL_0 (99.90%)
- **Neutral**: "The weather is cloudy." → LABEL_0 (80.10%)

## Files Included

- `gradio_app.py` - Main Gradio application
- `config.json` - Model configuration
- `model.safetensors` - Model weights
- `tokenizer_config.json` - Tokenizer configuration
- `vocab.txt` - Vocabulary file
- `special_tokens_map.json` - Special tokens mapping
