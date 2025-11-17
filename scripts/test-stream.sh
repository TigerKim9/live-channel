#!/bin/bash

STREAM_KEY=${1:-"test"}
VIDEO_FILE=${2:-""}

if [ -z "$VIDEO_FILE" ]; then
    echo "Usage: $0 <stream-key> <video-file>"
    echo "Example: $0 abc123def456 test.mp4"
    exit 1
fi

if [ ! -f "$VIDEO_FILE" ]; then
    echo "Error: Video file not found: $VIDEO_FILE"
    exit 1
fi

echo "🎥 Starting test stream..."
echo "   Stream Key: $STREAM_KEY"
echo "   Video File: $VIDEO_FILE"
echo ""
echo "Press Ctrl+C to stop streaming"
echo ""

ffmpeg -re -i "$VIDEO_FILE" \
  -c:v libx264 -preset veryfast -tune zerolatency \
  -b:v 2500k -maxrate 2500k -bufsize 5000k \
  -g 60 -c:a aac -b:a 128k -ar 44100 \
  -f flv rtmp://localhost:1935/live/$STREAM_KEY
