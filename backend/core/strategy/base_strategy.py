from abc import ABC, abstractmethod
import pandas as pd
from typing import Dict, Any

class BaseStrategy(ABC):
    """策略基类"""
    
    def __init__(self, name: str, parameters: Dict[str, Any] = None):
        self.name = name
        self.parameters = parameters or {}
        self.positions = {}
        self.cash = 100000
        self.initial_cash = 100000
        
    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        生成交易信号
        
        Args:
            data: 包含OHLCV数据的DataFrame
            
        Returns:
            添加了signal列的DataFrame，1表示买入，-1表示卖出，0表示持有
        """
        pass
    
    def calculate_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """计算技术指标"""
        return data
    
    def on_bar(self, bar: Dict[str, Any]):
        """每根K线的回调"""
        pass
    
    def on_order(self, order: Dict[str, Any]):
        """订单状态变化回调"""
        pass
    
    def get_portfolio_value(self) -> float:
        """获取投资组合总价值"""
        return self.cash + sum(
            pos['quantity'] * pos['current_price'] 
            for pos in self.positions.values()
        )
    
    def get_performance_metrics(self) -> Dict[str, float]:
        """获取绩效指标"""
        total_value = self.get_portfolio_value()
        total_return = (total_value - self.initial_cash) / self.initial_cash
        
        return {
            "total_return": total_return,
            "total_value": total_value,
            "cash": self.cash,
            "positions_value": total_value - self.cash
        }
