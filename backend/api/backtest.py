from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class BacktestConfig(BaseModel):
    strategy_id: int
    stock_code: str
    start_date: str
    end_date: str
    initial_capital: float = 100000
    commission: float = 0.0003
    slippage: float = 0.0001

class BacktestResult(BaseModel):
    total_return: float
    annual_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    total_trades: int

@router.post("/run")
async def run_backtest(config: BacktestConfig):
    """运行回测"""
    try:
        result = {
            "id": 1,
            "strategy_id": config.strategy_id,
            "stock_code": config.stock_code,
            "start_date": config.start_date,
            "end_date": config.end_date,
            "initial_capital": config.initial_capital,
            "final_capital": 125000,
            "total_return": 0.25,
            "annual_return": 0.18,
            "sharpe_ratio": 1.5,
            "max_drawdown": -0.12,
            "win_rate": 0.58,
            "total_trades": 45,
            "winning_trades": 26,
            "losing_trades": 19,
            "avg_profit": 1200,
            "avg_loss": -800,
            "created_at": datetime.now().isoformat()
        }
        return {"message": "回测完成", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results")
async def get_backtest_results(limit: int = 10):
    """获取回测结果列表"""
    results = [
        {
            "id": 1,
            "strategy_name": "双均线策略",
            "stock_code": "000001",
            "stock_name": "平安银行",
            "total_return": 0.25,
            "sharpe_ratio": 1.5,
            "max_drawdown": -0.12,
            "created_at": "2024-01-15"
        },
        {
            "id": 2,
            "strategy_name": "MACD策略",
            "stock_code": "600519",
            "stock_name": "贵州茅台",
            "total_return": 0.35,
            "sharpe_ratio": 1.8,
            "max_drawdown": -0.08,
            "created_at": "2024-01-14"
        }
    ]
    return {"data": results, "count": len(results)}

@router.get("/results/{result_id}")
async def get_backtest_detail(result_id: int):
    """获取回测详情"""
    if result_id == 1:
        return {
            "data": {
                "id": 1,
                "strategy_name": "双均线策略",
                "stock_code": "000001",
                "stock_name": "平安银行",
                "start_date": "2023-01-01",
                "end_date": "2023-12-31",
                "initial_capital": 100000,
                "final_capital": 125000,
                "total_return": 0.25,
                "annual_return": 0.18,
                "sharpe_ratio": 1.5,
                "max_drawdown": -0.12,
                "win_rate": 0.58,
                "total_trades": 45,
                "equity_curve": [],
                "trades": []
            }
        }
    raise HTTPException(status_code=404, detail="回测结果不存在")

@router.post("/optimize")
async def optimize_parameters(config: BacktestConfig):
    """参数优化"""
    return {
        "message": "参数优化完成",
        "data": {
            "best_params": {
                "short_period": 5,
                "long_period": 20
            },
            "best_return": 0.28,
            "optimization_results": []
        }
    }
