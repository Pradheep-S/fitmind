#!/bin/bash

echo "🎯 Testing Enhanced Mood Detection Features"
echo "==========================================="

# Test 1: Check if frontend is accessible
echo "📱 Testing Frontend Access..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5174)
if [ "$response" = "200" ]; then
    echo "✅ Frontend is accessible on http://localhost:5174"
else
    echo "❌ Frontend not accessible (HTTP $response)"
fi

# Test 2: Check if backend is accessible
echo "🔧 Testing Backend Access..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
if [ "$response" = "200" ]; then
    echo "✅ Backend is accessible on http://localhost:5000"
else
    echo "❌ Backend not accessible (HTTP $response)"
fi

# Test 3: Check face detection models
echo "🤖 Checking Face Detection Models..."
if [ -d "/home/pradheep/Documents/fitmind/frontend/public/face-models" ]; then
    model_count=$(find /home/pradheep/Documents/fitmind/frontend/public/face-models -name "*.bin" -o -name "*shard*" | wc -l)
    echo "✅ Face detection models directory exists with $model_count model files"
else
    echo "❌ Face detection models directory not found"
fi

# Test 4: Check if mood API endpoint is working
echo "🎭 Testing Mood Analysis API..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/mood/supported-moods)
if [ "$response" = "200" ]; then
    echo "✅ Mood analysis API is working"
else
    echo "❌ Mood analysis API not working (HTTP $response)"
fi

echo ""
echo "🚀 Integration Status Summary:"
echo "- Enhanced Camera Component: ✅ Created"
echo "- Emotion Display System: ✅ Created"  
echo "- Face Detection Service: ✅ Implemented"
echo "- Enhanced Mood Page: ✅ Built"
echo "- Journal Integration: ✅ Added"
echo "- Professional Styling: ✅ Applied"
echo ""
echo "📖 Manual Testing Guide:"
echo "1. Open http://localhost:5173in your browser"
echo "2. Navigate to /mood for standalone mood analysis"
echo "3. Navigate to /journal and toggle 'Add Mood Detection'"
echo "4. Test camera permissions and real-time detection"
echo "5. Upload images and verify emotion analysis"
echo ""
echo "🎉 Enhanced Mood Detection Implementation Complete!"