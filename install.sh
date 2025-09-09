#!/bin/bash

# Installation script for BERT Classification API
echo "Installing BERT Classification API dependencies..."

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    echo "Using existing virtual environment..."
    source .venv/bin/activate
else
    echo "Creating virtual environment..."
    python -m venv .venv
    source .venv/bin/activate
fi

# Install PyTorch CPU version first (smaller, faster download)
echo "Installing PyTorch (CPU version)..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install other requirements
echo "Installing other dependencies..."
pip install -r requirements.txt

echo "Installation complete!"
echo ""
echo "To run the API:"
echo "  source .venv/bin/activate"
echo "  uvicorn app:app --reload"
echo ""
echo "API will be available at: http://localhost:8000"
echo "Documentation at: http://localhost:8000/docs"
