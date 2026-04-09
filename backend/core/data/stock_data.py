import akshare as ak
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime
import time

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
            "is_mock": True,
            "ma5": 12.5,
            "ma10": 12.3,
            "ma20": 12.0,
            "macd": 0.05,
            "signal": 0.03,
            "histogram": 0.02
        }
    
    def get_hot_stocks(self, limit: int = 20) -> List[Dict]:
        """获取热门股票 - 使用连续上涨股票作为热门股票"""
        try:
            df = ak.stock_rank_lxsz_ths()
            df = df.head(limit)

            return [
                {
                    "rank": int(row['序号']),
                    "code": row['股票代码'],
                    "name": row['股票简称'],
                    "price": float(row['收盘价']),
                    "change_pct": float(row['连续涨跌幅'])
                }
                for _, row in df.iterrows()
            ]
        except Exception as e:
            print(f"获取热门股票失败: {e}")
            return []
    
    def get_market_indices(self) -> List[Dict]:
        """获取大盘指数 - 使用更稳定的历史数据接口"""
        # 指数代码映射
        indices_config = [
            {'symbol': 'sh000001', 'code': 'sh000001', 'name': '上证指数'},
            {'symbol': 'sz399001', 'code': 'sz399001', 'name': '深证成指'},
            {'symbol': 'sz399006', 'code': 'sz399006', 'name': '创业板指'}
        ]
        
        result = []
        
        for index_info in indices_config:
            try:
                # 使用历史数据接口获取最新一天的数据（更稳定）
                df = ak.stock_zh_index_daily(symbol=index_info['symbol'])
                
                if df.empty:
                    print(f"指数 {index_info['name']} 数据为空")
                    continue
                
                # 获取最新一天的数据
                latest = df.iloc[-1]
                
                # 计算涨跌额和涨跌幅
                if len(df) >= 2:
                    prev_close = df.iloc[-2]['close']
                    change = float(latest['close']) - float(prev_close)
                    change_pct = (change / float(prev_close)) * 100
                else:
                    change = 0.0
                    change_pct = 0.0
                
                result.append({
                    "code": index_info['code'],
                    "name": index_info['name'],
                    "price": float(latest['close']),
                    "change": round(change, 2),
                    "change_pct": round(change_pct, 2)
                })
                
                print(f"成功获取 {index_info['name']} 真实数据: {float(latest['close'])}")
                
            except Exception as e:
                print(f"获取指数 {index_info['name']} 失败: {type(e).__name__}: {str(e)[:100]}")
                continue
        
        if result:
            print(f"成功获取 {len(result)} 个指数的真实数据")
            return result
        else:
            # 如果所有指数都失败，返回模拟数据
            print("所有指数获取失败，返回模拟大盘指数数据")
            return self._get_mock_indices()
    
    def _get_mock_indices(self) -> List[Dict]:
        """返回模拟的大盘指数数据"""
        return [
            {"is_mock": True, "code": "sh000001", "name": "上证指数", "price": 3250.50, "change": 15.30, "change_pct": 0.47},
            {"is_mock": True, "code": "sz399001", "name": "深证成指", "price": 11200.80, "change": 45.20, "change_pct": 0.41},
            {"is_mock": True, "code": "sz399006", "name": "创业板指", "price": 2380.60, "change": 12.50, "change_pct": 0.53}
        ]
