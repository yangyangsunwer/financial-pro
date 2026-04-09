from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from core.data.stock_data import StockDataProvider

router = APIRouter()
data_provider = StockDataProvider()

class StockInfo(BaseModel):
    code: str
    name: str
    price: float
    change: float
    change_pct: float
    volume: int
    amount: float

class KlineData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

@router.get("/stocks/search")
async def search_stocks(keyword: str = Query(..., min_length=1)):
    """搜索股票"""
    try:
        stocks = data_provider.search_stocks(keyword)
        return {"data": stocks, "count": len(stocks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks/{stock_code}/realtime")
async def get_realtime_data(stock_code: str):
    """获取股票实时行情"""
    try:
        data = data_provider.get_realtime_data(stock_code)
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks/{stock_code}/kline")
async def get_kline_data(
    stock_code: str,
    period: str = Query("daily", regex="^(1min|5min|15min|30min|60min|daily|weekly|monthly)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """获取K线数据"""
    try:
        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)).strftime("%Y%m%d")
        if not end_date:
            end_date = datetime.now().strftime("%Y%m%d")
        
        data = data_provider.get_kline_data(stock_code, period, start_date, end_date)
        return {"data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks/{stock_code}/indicators")
async def get_technical_indicators(
    stock_code: str,
    indicators: str = Query("ma,macd,kdj,rsi")
):
    """获取技术指标"""
    try:
        indicator_list = indicators.split(",")
        data = data_provider.calculate_indicators(stock_code, indicator_list)
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hot")
async def get_hot_stocks(limit: int = Query(20, ge=1, le=100)):
    """获取热门股票"""
    try:
        stocks = data_provider.get_hot_stocks(limit)
        return {"data": stocks, "count": len(stocks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/index")
async def get_market_index():
    """获取大盘指数"""
    try:
        indices = data_provider.get_market_indices()
        return {"data": indices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
