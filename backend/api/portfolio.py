from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Position(BaseModel):
    stock_code: str
    stock_name: str
    quantity: int
    avg_price: float
    current_price: float
    profit_loss: float
    profit_loss_pct: float

@router.get("/overview")
async def get_portfolio_overview():
    """获取投资组合概览"""
    return {
        "data": {
            "total_assets": 150000,
            "available_cash": 50000,
            "market_value": 100000,
            "total_profit": 50000,
            "total_profit_pct": 0.5,
            "day_profit": 2000,
            "day_profit_pct": 0.013
        }
    }

@router.get("/positions")
async def get_positions():
    """获取持仓列表"""
    positions = [
        {
            "stock_code": "000001",
            "stock_name": "平安银行",
            "quantity": 1000,
            "avg_price": 12.5,
            "current_price": 13.2,
            "market_value": 13200,
            "profit_loss": 700,
            "profit_loss_pct": 0.056
        },
        {
            "stock_code": "600519",
            "stock_name": "贵州茅台",
            "quantity": 50,
            "avg_price": 1680,
            "current_price": 1750,
            "market_value": 87500,
            "profit_loss": 3500,
            "profit_loss_pct": 0.042
        }
    ]
    return {"data": positions, "count": len(positions)}

@router.get("/history")
async def get_trade_history(limit: int = 20):
    """获取交易历史"""
    trades = [
        {
            "id": 1,
            "stock_code": "000001",
            "stock_name": "平安银行",
            "type": "buy",
            "price": 12.5,
            "quantity": 1000,
            "amount": 12500,
            "commission": 3.75,
            "time": "2024-01-10 09:30:00"
        },
        {
            "id": 2,
            "stock_code": "600519",
            "stock_name": "贵州茅台",
            "type": "buy",
            "price": 1680,
            "quantity": 50,
            "amount": 84000,
            "commission": 25.2,
            "time": "2024-01-08 10:15:00"
        }
    ]
    return {"data": trades, "count": len(trades)}

@router.get("/performance")
async def get_performance_metrics():
    """获取绩效指标"""
    return {
        "data": {
            "total_return": 0.5,
            "annual_return": 0.35,
            "sharpe_ratio": 1.8,
            "max_drawdown": -0.15,
            "win_rate": 0.62,
            "profit_factor": 2.1,
            "total_trades": 120,
            "winning_trades": 74,
            "losing_trades": 46
        }
    }
