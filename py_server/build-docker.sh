#!/bin/bash

# 构建Docker镜像的准备脚本
# 复制必要的文件到构建上下文

echo "准备Docker构建环境..."

# 复制环境变量文件（可选）
if [ -f "../.env" ]; then
    cp ../.env ./.env
    echo "✅ 已复制 .env 文件"
else
    echo "⚠️  未找到 ../.env 文件"
fi

# 复制私钥文件
if [ -f "../private_key.pem" ]; then
    cp ../private_key.pem ./private_key.pem
    echo "✅ 已复制 private_key.pem 文件"
else
    echo "⚠️  未找到 ../private_key.pem 文件"
fi

# 构建镜像
echo "🔨 开始构建Docker镜像..."
docker build -t nan-py-server .

# 清理构建时使用的文件
echo "🧹 清理构建文件..."
rm -f ./.env ./private_key.pem

echo "✅ 构建完成！"
echo "使用方法："
echo "  运行容器: ./run-docker.sh"