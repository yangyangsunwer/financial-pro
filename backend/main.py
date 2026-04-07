from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api import market, strategy, backtest, portfolio

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 量化交易系统启动中...")
    yield
    print("👋 量化交易系统关闭")

app = FastAPI(
    title="A股量化交易系统",
    description="支持策略回测、实时监控、模拟交易的量化交易平台",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market.router, prefix="/api/market", tags=["市场数据"])
app.include_router(strategy.router, prefix="/api/strategy", tags=["策略管理"])
app.include_router(backtest.router, prefix="/api/backtest", tags=["策略回测"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["投资组合"])

@app.get("/")
async def root():
    return {
        "message": "A股量化交易系统 API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
