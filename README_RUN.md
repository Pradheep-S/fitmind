# 🚀 How to Run the FitMind BERT Classification Project

This guide explains how to set up, run, and test your BERT-based text classification project both locally and for deployment (including Hugging Face Spaces).

---

## 1. **Clone or Download the Project**

If you haven't already, clone your repository or copy all project files to your working directory.

---

## 2. **Set Up Python Environment**

It's recommended to use a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## 3. **Install Dependencies**

Install all required packages:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

If you want to run the Gradio app (for Hugging Face Spaces or local demo):

```bash
pip install gradio==4.7.1
```

---

## 4. **Add Model Files**

Place these files in your project root (or `huggingface_deployment/` for Spaces):
- `model.safetensors`
- `config.json`
- `tokenizer_config.json`
- `special_tokens_map.json`
- `vocab.txt`

---

## 5. **Run the FastAPI Backend (Local API)**

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

- Visit [http://localhost:8000/docs](http://localhost:8000/docs) for API documentation
- Test endpoints like `/predict`, `/health`, `/model-info`

---

## 6. **Run the Gradio App (Web UI & Spaces)**

```bash
python3 gradio_app.py
```

- Visit [http://localhost:7860](http://localhost:7860) for the Gradio web interface

---

## 7. **Test the API**

Example using `curl`:

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a great product!"}'
```

---

## 8. **Deploy to Hugging Face Spaces**

1. Create a new Space (SDK: Gradio)
2. Upload all files from `huggingface_deployment/`
3. Wait for build and test your public Space

---

## 9. **Troubleshooting**
- Ensure all model files are present
- Use the correct Python version (3.10 recommended)
- If you see port errors, make sure no other process is using the port
- For large model files, upload may take time

---

## 10. **Extra: Run All Tests Automatically**

You can use the provided script:

```bash
bash test_api.sh
```

---

**You're all set!**

- For API: use FastAPI (`app.py`)
- For Web UI: use Gradio (`gradio_app.py`)
- For Hugging Face Spaces: upload everything in `huggingface_deployment/`

Enjoy your BERT-powered text classification project!
