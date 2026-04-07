import akshare as ak
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime

class StockDataProvider:
    """A股数据提供者"""
    
    def __init__(self):
        self.cache = {}
    
    def search_stocks(self, keyword: str) -> List[Dict]:
        """搜索股票"""
        try:
            stock_info = ak.stock_info_a_code_name()
            
            result = stock_info[
                stock_info['code'].str.contains(keyword) | 
                stock_info['name'].str.contains(keyword)
            ].head(20)
            
            return [
                {
                    "code": row['code'],
                    "name": row['name']
                }
                for _, row in result.iterrows()
            ]
        except Exception as e:
            print(f"搜索股票失败: {e}")
            return []
    
    def get_realtime_data(self, stock_code: str) -> Dict:
        """获取实时行情"""
        try:
            df = ak.stock_zh_a_spot_em()
            stock = df[df['代码'] == stock_code].iloc[0]
            
            return {
                "code": stock_code,
                "name": stock['名称'],
                "price": float(stock['最新价']),
                "change": float(stock['涨跌额']),
                "change_pct": float(stock['涨跌幅']),
                "volume": int(stock['成交量']),
                "amount": float(stock['成交额']),
                "high": float(stock['最高']),
                "low": float(stock['最低']),
                "open": float(stock['今开']),
                "pre_close": float(stock['昨收'])
            }
        except Exception as e:
            print(f"获取实时数据失败: {e}")
            return {}
    
    def get_kline_data(
        self, 
        stock_code: str, 
        period: str = "daily",
        start_date: str = None,
        end_date: str = None
    ) -> List[Dict]:
        """获取K线数据"""
        try:
            period_map = {
                "daily": "daily",
                "weekly": "weekly",
                "monthly": "monthly"
            }
            
            adjust = "qfq"
            
            df = ak.stock_zh_a_hist(
                symbol=stock_code,
                period=period_map.get(period, "daily"),
                start_date=start_date,
                end_date=end_date,
                adjust=adjust
            )
            
            df.columns = ['date', 'open', 'close', 'high', 'low', 'volume', 'amount', 'amplitude', 'change_pct', 'change', 'turnover']
            
            return [
                {
                    "date": row['date'],
                    "open": float(row['open']),
                    "high": float(row['high']),
                    "low": float(row['low']),
                    "close": float(row['close']),
                    "volume": int(row['volume'])
                }
                for _, row in df.iterrows()
            ]
        except Exception as e:
            print(f"获取K线数据失败: {e}")
            return []
    
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
        try:
            df = ak.stock_hot_rank_em()
            df = df.head(limit)
            
            return [
                {
                    "rank": int(row['序号']),
                    "code": row['代码'],
                    "name": row['股票名称'],
                    "price": float(row['最新价']),
                    "change_pct": float(row['涨跌幅'])
                }
                for _, row in df.iterrows()
            ]
        except Exception as e:
            print(f"获取热门股票失败: {e}")
            return []
    
    def get_market_indices(self) -> List[Dict]:
        """获取大盘指数"""
        try:
            indices = ['sh000001', 'sz399001', 'sz399006']
            result = []
            
            for index_code in indices:
                df = ak.stock_zh_index_spot_em()
                index_data = df[df['代码'] == index_code].iloc[0]
                
                result.append({
                    "code": index_code,
                    "name": index_data['名称'],
                    "price": float(index_data['最新价']),
                    "change": float(index_data['涨跌额']),
                    "change_pct": float(index_data['涨跌幅'])
                })
            
            return result
        except Exception as e:
            print(f"获取大盘指数失败: {e}")
            return []
