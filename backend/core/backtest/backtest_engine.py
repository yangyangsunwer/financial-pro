import pandas as pd
import numpy as np
from typing import Dict, List, Any
from datetime import datetime

class BacktestEngine:
    """回测引擎"""
    
    def __init__(
        self,
        initial_capital: float = 100000,
        commission: float = 0.0003,
        slippage: float = 0.0001
    ):
        self.initial_capital = initial_capital
        self.commission = commission
        self.slippage = slippage
        self.reset()
    
    def reset(self):
        """重置回测状态"""
        self.cash = self.initial_capital
        self.positions = {}
        self.trades = []
        self.equity_curve = []
        self.current_date = None
    
    def run(self, data: pd.DataFrame, signals: pd.DataFrame) -> Dict[str, Any]:
        """
        运行回测
        
        Args:
            data: OHLCV数据
            signals: 交易信号（1买入，-1卖出，0持有）
            
        Returns:
            回测结果字典
        """
        self.reset()
        
        for idx, row in data.iterrows():
            self.current_date = row['date']
            signal = signals.loc[idx, 'signal'] if idx in signals.index else 0
            
            if signal == 1:
                self._execute_buy(row)
            elif signal == -1:
                self._execute_sell(row)
            
            portfolio_value = self._calculate_portfolio_value(row['close'])
            self.equity_curve.append({
                'date': self.current_date,
                'value': portfolio_value,
                'cash': self.cash,
                'positions_value': portfolio_value - self.cash
            })
        
        return self._calculate_metrics()
    
    def _execute_buy(self, bar: pd.Series):
        """执行买入"""
        if self.cash < 1000:
            return
        
        price = bar['close'] * (1 + self.slippage)
        
        max_quantity = int(self.cash * 0.95 / price / 100) * 100
        
        if max_quantity < 100:
            return
        
        cost = price * max_quantity
        commission_fee = cost * self.commission
        total_cost = cost + commission_fee
        
        if total_cost > self.cash:
            return
        
        self.cash -= total_cost
        
        if 'stock' in self.positions:
            self.positions['stock']['quantity'] += max_quantity
            self.positions['stock']['avg_price'] = (
                (self.positions['stock']['avg_price'] * self.positions['stock']['quantity'] + cost) /
                (self.positions['stock']['quantity'] + max_quantity)
            )
        else:
            self.positions['stock'] = {
                'quantity': max_quantity,
                'avg_price': price
            }
        
        self.trades.append({
            'date': self.current_date,
            'type': 'buy',
            'price': price,
            'quantity': max_quantity,
            'commission': commission_fee
        })
    
    def _execute_sell(self, bar: pd.Series):
        """执行卖出"""
        if 'stock' not in self.positions or self.positions['stock']['quantity'] == 0:
            return
        
        price = bar['close'] * (1 - self.slippage)
        quantity = self.positions['stock']['quantity']
        
        revenue = price * quantity
        commission_fee = revenue * self.commission
        net_revenue = revenue - commission_fee
        
        self.cash += net_revenue
        
        self.trades.append({
            'date': self.current_date,
            'type': 'sell',
            'price': price,
            'quantity': quantity,
            'commission': commission_fee,
            'profit': net_revenue - self.positions['stock']['avg_price'] * quantity
        })
        
        del self.positions['stock']
    
    def _calculate_portfolio_value(self, current_price: float) -> float:
        """计算投资组合总价值"""
        positions_value = 0
        if 'stock' in self.positions:
            positions_value = self.positions['stock']['quantity'] * current_price
        return self.cash + positions_value
    
    def _calculate_metrics(self) -> Dict[str, Any]:
        """计算绩效指标"""
        equity_df = pd.DataFrame(self.equity_curve)
        
        final_value = equity_df['value'].iloc[-1]
        total_return = (final_value - self.initial_capital) / self.initial_capital
        
        equity_df['returns'] = equity_df['value'].pct_change()
        
        trading_days = len(equity_df)
        annual_return = (1 + total_return) ** (252 / trading_days) - 1 if trading_days > 0 else 0
        
        returns_std = equity_df['returns'].std()
        sharpe_ratio = (annual_return / returns_std * np.sqrt(252)) if returns_std > 0 else 0
        
        equity_df['cummax'] = equity_df['value'].cummax()
        equity_df['drawdown'] = (equity_df['value'] - equity_df['cummax']) / equity_df['cummax']
        max_drawdown = equity_df['drawdown'].min()
        
        winning_trades = [t for t in self.trades if t.get('profit', 0) > 0]
        losing_trades = [t for t in self.trades if t.get('profit', 0) < 0]
        
        win_rate = len(winning_trades) / len(self.trades) if self.trades else 0
        
        return {
            'initial_capital': self.initial_capital,
            'final_capital': final_value,
            'total_return': total_return,
            'annual_return': annual_return,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'total_trades': len(self.trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': win_rate,
            'equity_curve': equity_df.to_dict('records'),
            'trades': self.trades
        }
