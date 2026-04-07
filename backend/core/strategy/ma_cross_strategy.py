import pandas as pd
from .base_strategy import BaseStrategy

class MACrossStrategy(BaseStrategy):
    """双均线交叉策略"""
    
    def __init__(self, short_period: int = 5, long_period: int = 20):
        super().__init__(
            name="双均线策略",
            parameters={
                "short_period": short_period,
                "long_period": long_period
            }
        )
        self.short_period = short_period
        self.long_period = long_period
    
    def calculate_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """计算均线指标"""
        data['ma_short'] = data['close'].rolling(window=self.short_period).mean()
        data['ma_long'] = data['close'].rolling(window=self.long_period).mean()
        return data
    
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        生成交易信号
        
        策略逻辑：
        - 短期均线上穿长期均线：买入信号
        - 短期均线下穿长期均线：卖出信号
        """
        data = self.calculate_indicators(data)
        
        data['signal'] = 0
        
        data['ma_short_prev'] = data['ma_short'].shift(1)
        data['ma_long_prev'] = data['ma_long'].shift(1)
        
        buy_condition = (
            (data['ma_short'] > data['ma_long']) & 
            (data['ma_short_prev'] <= data['ma_long_prev'])
        )
        data.loc[buy_condition, 'signal'] = 1
        
        sell_condition = (
            (data['ma_short'] < data['ma_long']) & 
            (data['ma_short_prev'] >= data['ma_long_prev'])
        )
        data.loc[sell_condition, 'signal'] = -1
        
        return data
