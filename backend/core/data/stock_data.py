from typing import List, Dict, Optional
from datetime import datetime, timedelta

# Mock data for development - replace with real akshare when dependencies are installed
MOCK_MODE = True

class StockDataProvider:
    """A股数据提供者"""
    
    def __init__(self):
        self.cache = {}
    
    def search_stocks(self, keyword: str) -> List[Dict]:
        """搜索股票"""
        mock_stocks = [
            {"code": "600519", "name": "贵州茅台"},
            {"code": "000001", "name": "平安银行"},
            {"code": "600036", "name": "招商银行"},
            {"code": "000858", "name": "五粮液"},
            {"code": "601318", "name": "中国平安"}
        ]
        return [s for s in mock_stocks if keyword in s["code"] or keyword in s["name"]][:20]
    
    def get_realtime_data(self, stock_code: str) -> Dict:
        """获取实时行情"""
        return {
            "code": stock_code,
            "name": "贵州茅台",
            "price": 1680.50,
            "change": 12.30,
            "change_pct": 0.74,
            "volume": 1234567,
            "amount": 2.08e9,
            "high": 1688.00,
            "low": 1672.00,
            "open": 1675.00,
            "pre_close": 1668.20
        }
    
    def get_kline_data(
        self, 
        stock_code: str, 
        period: str = "daily",
        start_date: str = None,
        end_date: str = None
    ) -> List[Dict]:
        """获取K线数据"""
        base_date = datetime.now() - timedelta(days=30)
        mock_data = []
        for i in range(30):
            date = base_date + timedelta(days=i)
            base_price = 1650 + i * 2
            mock_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": base_price,
                "high": base_price + 10,
                "low": base_price - 8,
                "close": base_price + 5,
                "volume": 1000000 + i * 10000
            })
        return mock_data
    
    def calculate_indicators(self, stock_code: str, indicators: List[str]) -> Dict:
        """计算技术指标"""
        return {
            "ma5": 12.5,
            "ma10": 12.3,
            "ma20": 12.0,
            "macd": 0.05,
            "signal": 0.03,
            "histogram": 0.02
        }
    
    def get_hot_stocks(self, limit: int = 20) -> List[Dict]:
        """获取热门股票"""
        mock_hot = [
            {"rank": 1, "code": "600519", "name": "贵州茅台", "price": 1680.50, "change_pct": 2.5},
            {"rank": 2, "code": "000858", "name": "五粮液", "price": 168.30, "change_pct": 3.2},
            {"rank": 3, "code": "601318", "name": "中国平安", "price": 45.60, "change_pct": 1.8},
            {"rank": 4, "code": "600036", "name": "招商银行", "price": 38.20, "change_pct": 1.5},
            {"rank": 5, "code": "000001", "name": "平安银行", "price": 12.50, "change_pct": 2.1}
        ]
        return mock_hot[:limit]
    
    def get_market_indices(self) -> List[Dict]:
        """获取大盘指数"""
        return [
            {"code": "sh000001", "name": "上证指数", "price": 3250.50, "change": 15.30, "change_pct": 0.47},
            {"code": "sz399001", "name": "深证成指", "price": 11200.80, "change": 45.20, "change_pct": 0.41},
            {"code": "sz399006", "name": "创业板指", "price": 2380.60, "change": 12.50, "change_pct": 0.53}
        ]
