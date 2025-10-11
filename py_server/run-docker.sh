#!/bin/bash

echo "准备Docker容器运行..."
docker run -d \
  --name nan-py-server-container \
  -p 8000:8000 \
  nan-py-server

echo "✅ Docker容器运行中，监听端口 8000"
