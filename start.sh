#!/bin/bash

echo "🚀 启动A股量化交易系统..."

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到Python3，请先安装Python"
    exit 1
fi

# 启动后端
echo "📦 启动后端服务..."
cd backend

if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

echo "✅ 后端服务启动在 http://localhost:8000"
uvicorn main:app --reload &
BACKEND_PID=$!

cd ..

# 启动前端
echo "📦 启动前端服务..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

echo "✅ 前端服务启动在 http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "🎉 量化交易系统已启动！"
echo "========================================="
echo "前端地址: http://localhost:3000"
echo "后端API: http://localhost:8000"
echo "API文档: http://localhost:8000/docs"
echo "========================================="
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待中断信号
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
