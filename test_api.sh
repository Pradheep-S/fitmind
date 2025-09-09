#!/bin/bash

echo "🚀 Starting BERT Classification API Server..."
cd /home/pradheep/Documents/fitmind
source .venv/bin/activate

# Start server in background
uvicorn app:app --host 127.0.0.1 --port 8002 &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 10

echo "🔍 Testing API endpoints..."

echo -e "\n1. Testing Root Endpoint:"
curl -s http://127.0.0.1:8002/ | python3 -m json.tool

echo -e "\n2. Testing Health Check:"
curl -s http://127.0.0.1:8002/health | python3 -m json.tool

echo -e "\n3. Testing Model Info:"
curl -s http://127.0.0.1:8002/model-info | python3 -m json.tool

echo -e "\n4. Testing Text Classification (Positive Example):"
curl -s -X POST "http://127.0.0.1:8002/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "This movie is absolutely amazing! I loved every minute of it."}' | python3 -m json.tool

echo -e "\n5. Testing Text Classification (Negative Example):"
curl -s -X POST "http://127.0.0.1:8002/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "This product is terrible and I hate it."}' | python3 -m json.tool

echo -e "\n6. Testing Text Classification (Neutral Example):"
curl -s -X POST "http://127.0.0.1:8002/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "The weather today is cloudy."}' | python3 -m json.tool

echo -e "\n✅ All tests completed!"
echo "🌐 API Documentation available at: http://127.0.0.1:8002/docs"

# Keep server running
echo "🔧 Server is running on http://127.0.0.1:8002"
echo "📝 Press Ctrl+C to stop the server"
wait $SERVER_PID
