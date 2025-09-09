# 🚀 Hugging Face Spaces Deployment Guide

## Files to Upload (All from `/home/pradheep/Documents/fitmind/huggingface_deployment/`)

### 📋 **Required Files List:**

1. **README.md** (2.2 KB) - Space configuration and documentation
2. **gradio_app.py** (7.6 KB) - Main Gradio application  
3. **requirements.txt** (122 bytes) - Python dependencies
4. **runtime.txt** (12 bytes) - Python version specification

### 🤖 **Model Files:**
5. **config.json** (687 bytes) - Model configuration
6. **model.safetensors** (438 MB) - **LARGEST FILE** - Model weights
7. **tokenizer_config.json** (1.3 KB) - Tokenizer configuration  
8. **vocab.txt** (232 KB) - Vocabulary file
9. **special_tokens_map.json** (125 bytes) - Special tokens mapping

### 📝 **Step-by-Step Upload Process:**

## 1. Create Space
- Go to https://huggingface.co/spaces
- Click "Create new Space"
- **Space name**: `bert-text-classifier` (or your choice)
- **SDK**: **Gradio** ✅
- **Visibility**: Public/Private (your choice)
- **License**: MIT

## 2. Upload Files (Two Options)

### Option A: Web Interface (Recommended)
1. **Upload smaller files first**:
   - README.md
   - gradio_app.py  
   - requirements.txt
   - runtime.txt
   - config.json
   - tokenizer_config.json
   - special_tokens_map.json
   - vocab.txt

2. **Upload large file last**:
   - model.safetensors (438 MB) - This will take several minutes

### Option B: Git LFS (Advanced)
```bash
# Clone your space
git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
cd YOUR_SPACE_NAME

# Copy files
cp /home/pradheep/Documents/fitmind/huggingface_deployment/* .

# Add to git LFS for large files
git lfs track "*.safetensors"
git add .gitattributes
git add .
git commit -m "Add BERT classification model"
git push
```

## 3. Expected Result
- **Space URL**: `https://huggingface.co/spaces/YOUR_USERNAME/bert-text-classifier`
- **Build time**: ~5-10 minutes (due to dependencies and model loading)
- **Interface**: Gradio web interface with text input and classification results

## 4. Features After Deployment
✅ **Interactive Web UI** - Text input box with classify button  
✅ **Example Texts** - Pre-loaded examples to test  
✅ **Real-time Results** - Predicted class, confidence, probabilities  
✅ **Model Info Tab** - Details about the BERT model  
✅ **API Usage Tab** - Instructions for programmatic access  

## 5. Testing Your Deployed Space
Once live, test with these examples:
- **Positive**: "This movie is absolutely amazing!"
- **Negative**: "This product is terrible!"  
- **Neutral**: "The weather is cloudy."

## 🎯 **Final Notes:**
- The model.safetensors file (438 MB) will take the longest to upload
- Hugging Face Spaces will automatically install dependencies from requirements.txt
- The space will take 2-3 minutes to load the BERT model on first access
- Your space will be publicly accessible once deployed (if set to public)

## 📞 **Need Help?**
If you encounter issues:
1. Check the "Logs" tab in your Hugging Face Space
2. Ensure all files uploaded correctly  
3. Verify the README.md metadata is correct
4. Make sure model files are in the root directory
