import akshare as ak
import requests
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import time
import traceback

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
        """获取K线数据 - 使用腾讯财经API"""
        print(f"[K线] 原始股票代码: {stock_code}")

        # 腾讯API需要 sz/sh 前缀格式
        if not stock_code.startswith(('sh', 'sz')):
            if len(stock_code) == 6:
                if stock_code.startswith('6'):
                    stock_code = f'sh{stock_code}'
                elif stock_code.startswith(('0', '3')):
                    stock_code = f'sz{stock_code}'
                else:
                    stock_code = f'sh{stock_code}'

        # 日期格式转换：20250101 -> 2025-01-01
        if start_date and len(start_date) == 8:
            start_date = f"{start_date[:4]}-{start_date[4:6]}-{start_date[6:]}"
        if end_date and len(end_date) == 8:
            end_date = f"{end_date[:4]}-{end_date[4:6]}-{end_date[6:]}"

        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        # 腾讯API周期映射
        period_map = {
            "daily": "day",
            "weekly": "week",
            "monthly": "month"
        }
        qt_period = period_map.get(period, "day")

        print(f"[K线] 腾讯API请求: code={stock_code}, period={qt_period}, {start_date} ~ {end_date}")

        # 重试机制：最多重试3次
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"[K线] 第 {attempt + 1}/{max_retries} 次尝试...")
                url = f"https://web.ifzq.gtimg.cn/appstock/app/fqkline/get"
                params = {
                    "param": f"{stock_code},{qt_period},{start_date},{end_date},500,qfq"
                }
                resp = requests.get(url, params=params, timeout=10)
                data = resp.json()

                stock_data = data.get("data", {}).get(stock_code, {})
                # 前复权数据在 qfqday/qfqweek/qfqmonth 或 day/week/month 字段中
                kline = stock_data.get(f"qfq{qt_period}", stock_data.get(qt_period, []))

                print(f"[K线] 获取到数据行数: {len(kline)}")

                if not kline:
                    print(f"[K线] 数据为空")
                    return []

                # 腾讯API返回格式: [日期, 开盘, 收盘, 最高, 最低, 成交量]
                return [
                    {
                        "date": item[0],
                        "open": float(item[1]),
                        "high": float(item[3]),
                        "low": float(item[4]),
                        "close": float(item[2]),
                        "volume": int(float(item[5]))
                    }
                    for item in kline
                ]
            except Exception as e:
                print(f"[K线] 第 {attempt + 1} 次尝试失败: {type(e).__name__}: {str(e)}")
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    print(f"[K线] 等待 {wait_time} 秒后重试...")
                    time.sleep(wait_time)
                else:
                    print(f"[K线] 所有重试均失败")
                    traceback.print_exc()
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

            print(f"[热门股票] 获取到 {len(df)} 只股票")

            result = []
            for _, row in df.iterrows():
                code = row['股票代码']
                print(f"[热门股票] 原始代码: {code}")
                # 确保代码格式正确（如果不是以 sh/sz 开头，则添加前缀）
                if not code.startswith(('sh', 'sz')):
                    if code.startswith('6'):
                        code = f'sh{code}'
                    elif code.startswith(('0', '3')):
                        code = f'sz{code}'
                    else:
                        code = f'sh{code}'

                print(f"[热门股票] 转换后代码: {code}")

                result.append({
                    "rank": int(row['序号']),
                    "code": code,
                    "name": row['股票简称'],
                    "price": float(row['收盘价']),
                    "change_pct": float(row['连续涨跌幅'])
                })

            return result
        except Exception as e:
            print(f"[热门股票] 获取热门股票失败: {type(e).__name__}: {str(e)}")
            traceback.print_exc()
            return []
    
    def get_market_indices(self) -> List[Dict]:
        """获取大盘指数 - 使用腾讯财经API"""
        indices_config = [
            {'code': 'sh000001', 'name': '上证指数', 'qt_code': 'sh000001'},
            {'code': 'sz399001', 'name': '深证成指', 'qt_code': 'sz399001'},
            {'code': 'sz399006', 'name': '创业板指', 'qt_code': 'sz399006'}
        ]

        result = []
        try:
            # 腾讯实时行情API
            codes = ",".join([i['qt_code'] for i in indices_config])
            url = f"https://qt.gtimg.cn/q={codes}"
            resp = requests.get(url, timeout=10)
            resp.encoding = 'gbk'
            lines = resp.text.strip().split(';')

            for i, line in enumerate(lines):
                if i >= len(indices_config):
                    break
                line = line.strip()
                if not line or '=' not in line:
                    continue
                # 格式: v_sh000001="1~上证指数~000001~3250.50~3235.20~..."
                parts = line.split('=')[1].strip('"').split('~')
                if len(parts) < 40:
                    continue

                price = float(parts[3])
                pre_close = float(parts[4])
                change = round(price - pre_close, 2)
                change_pct = round((change / pre_close) * 100, 2) if pre_close else 0

                result.append({
                    "code": indices_config[i]['code'],
                    "name": indices_config[i]['name'],
                    "price": price,
                    "change": change,
                    "change_pct": change_pct
                })

            print(f"成功获取 {len(result)} 个指数的真实数据")
            return result if result else self._get_mock_indices()
        except Exception as e:
            print(f"获取大盘指数失败: {type(e).__name__}: {str(e)}")
            traceback.print_exc()
            return self._get_mock_indices()

    def _get_mock_indices(self) -> List[Dict]:
        """返回模拟的大盘指数数据"""
        return [
            {"is_mock": True, "code": "sh000001", "name": "上证指数", "price": 3250.50, "change": 15.30, "change_pct": 0.47},
            {"is_mock": True, "code": "sz399001", "name": "深证成指", "price": 11200.80, "change": 45.20, "change_pct": 0.41},
            {"is_mock": True, "code": "sz399006", "name": "创业板指", "price": 2380.60, "change": 12.50, "change_pct": 0.53}
        ]
