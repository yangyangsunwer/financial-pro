from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import pandas as pd
import numpy as np

from core.data.stock_data import StockDataProvider
from core.backtest.backtest_engine import BacktestEngine

router = APIRouter()

stock_data_provider = StockDataProvider()

# 存储回测结果（简单内存存储）
backtest_results_store = []

class BacktestConfig(BaseModel):
    strategy_id: int
    stock_code: str
    start_date: str
    end_date: str
    initial_capital: float = 100000
    commission: float = 0.0003
    slippage: float = 0.0001


def generate_signals(data: pd.DataFrame, strategy_id: int) -> tuple:
    """根据策略ID生成交易信号，同时返回指标数据用于图表"""
    signals = pd.DataFrame(index=data.index)
    signals['signal'] = 0
    indicators = {}  # 用于图表展示的指标线

    if strategy_id == 1 or strategy_id not in [1, 2, 3]:
        # 双均线策略
        data['ma5'] = data['close'].rolling(window=5).mean()
        data['ma20'] = data['close'].rolling(window=20).mean()

        prev_short = data['ma5'].shift(1)
        prev_long = data['ma20'].shift(1)

        signals.loc[(prev_short <= prev_long) & (data['ma5'] > data['ma20']), 'signal'] = 1
        signals.loc[(prev_short >= prev_long) & (data['ma5'] < data['ma20']), 'signal'] = -1

        indicators['lines'] = [
            {'name': 'MA5', 'key': 'ma5', 'color': '#FF6600'},
            {'name': 'MA20', 'key': 'ma20', 'color': '#0066FF'}
        ]

    elif strategy_id == 2:
        # MACD策略 - 也加均线辅助展示
        data['ma5'] = data['close'].rolling(window=5).mean()
        data['ma10'] = data['close'].rolling(window=10).mean()
        ema12 = data['close'].ewm(span=12, adjust=False).mean()
        ema26 = data['close'].ewm(span=26, adjust=False).mean()
        data['dif'] = ema12 - ema26
        data['dea'] = data['dif'].ewm(span=9, adjust=False).mean()
        data['macd_hist'] = (data['dif'] - data['dea']) * 2

        prev_dif = data['dif'].shift(1)
        prev_dea = data['dea'].shift(1)

        signals.loc[(prev_dif <= prev_dea) & (data['dif'] > data['dea']), 'signal'] = 1
        signals.loc[(prev_dif >= prev_dea) & (data['dif'] < data['dea']), 'signal'] = -1

        indicators['lines'] = [
            {'name': 'MA5', 'key': 'ma5', 'color': '#FF6600'},
            {'name': 'MA10', 'key': 'ma10', 'color': '#0066FF'}
        ]
        indicators['macd'] = True

    elif strategy_id == 3:
        # 网格交易策略：基于布林带
        data['ma20'] = data['close'].rolling(window=20).mean()
        std20 = data['close'].rolling(window=20).std()
        data['upper_band'] = data['ma20'] + 2 * std20
        data['lower_band'] = data['ma20'] - 2 * std20

        signals.loc[data['close'] <= data['lower_band'], 'signal'] = 1
        signals.loc[data['close'] >= data['upper_band'], 'signal'] = -1

        indicators['lines'] = [
            {'name': 'MA20', 'key': 'ma20', 'color': '#0066FF'},
            {'name': '上轨', 'key': 'upper_band', 'color': '#FF3333'},
            {'name': '下轨', 'key': 'lower_band', 'color': '#33CC33'}
        ]

    return signals, indicators


@router.post("/run")
async def run_backtest(config: BacktestConfig):
    """运行回测 - 使用真实数据"""
    try:
        print(f"[回测] 开始回测: strategy_id={config.strategy_id}, stock={config.stock_code}, "
              f"{config.start_date} ~ {config.end_date}")

        # 1. 获取真实K线数据
        kline_data = stock_data_provider.get_kline_data(
            stock_code=config.stock_code,
            period="daily",
            start_date=config.start_date,
            end_date=config.end_date
        )

        if not kline_data:
            raise HTTPException(status_code=400, detail="获取K线数据失败，无法进行回测")

        print(f"[回测] 获取到 {len(kline_data)} 条K线数据")

        # 2. 转换为DataFrame
        df = pd.DataFrame(kline_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)

        if len(df) < 30:
            raise HTTPException(status_code=400, detail=f"K线数据不足（仅{len(df)}条），至少需要30条数据")

        # 3. 生成交易信号
        signals, indicators = generate_signals(df, config.strategy_id)
        print(f"[回测] 买入信号: {(signals['signal'] == 1).sum()} 次, "
              f"卖出信号: {(signals['signal'] == -1).sum()} 次")

        # 4. 运行回测引擎
        engine = BacktestEngine(
            initial_capital=config.initial_capital,
            commission=config.commission,
            slippage=config.slippage
        )
        result = engine.run(df, signals)

        print(f"[回测] 回测完成: 总收益率={result['total_return']:.4f}, "
              f"总交易={result['total_trades']}次")

        # 5. 组装图表数据
        dates = [d.strftime('%Y-%m-%d') for d in df['date']]
        kline_chart = []
        for _, row in df.iterrows():
            kline_chart.append([
                round(row['open'], 2),
                round(row['close'], 2),
                round(row['low'], 2),
                round(row['high'], 2)
            ])

        # 均线/指标线数据
        indicator_lines = []
        for line_cfg in indicators.get('lines', []):
            key = line_cfg['key']
            if key in df.columns:
                indicator_lines.append({
                    'name': line_cfg['name'],
                    'color': line_cfg['color'],
                    'data': [round(v, 2) if pd.notna(v) else None for v in df[key]]
                })

        # MACD 子图数据
        macd_data = None
        if indicators.get('macd') and 'dif' in df.columns:
            macd_data = {
                'dif': [round(v, 4) if pd.notna(v) else None for v in df['dif']],
                'dea': [round(v, 4) if pd.notna(v) else None for v in df['dea']],
                'hist': [round(v, 4) if pd.notna(v) else None for v in df['macd_hist']]
            }

        # 买卖点
        buy_points = []
        sell_points = []
        for idx, row in df.iterrows():
            sig = signals.loc[idx, 'signal']
            if sig == 1:
                buy_points.append({
                    'date': row['date'].strftime('%Y-%m-%d'),
                    'price': round(row['close'], 2)
                })
            elif sig == -1:
                sell_points.append({
                    'date': row['date'].strftime('%Y-%m-%d'),
                    'price': round(row['close'], 2)
                })

        # 资金曲线
        equity_dates = []
        equity_values = []
        for ec in result.get('equity_curve', []):
            if isinstance(ec.get('date'), str):
                equity_dates.append(ec['date'])
            else:
                equity_dates.append(ec['date'].strftime('%Y-%m-%d') if hasattr(ec['date'], 'strftime') else str(ec['date']))
            equity_values.append(round(ec['value'], 2))

        # 6. 组装返回结果
        strategy_names = {1: "双均线策略", 2: "MACD金叉策略", 3: "网格交易策略"}
        backtest_result = {
            "id": len(backtest_results_store) + 1,
            "strategy_id": config.strategy_id,
            "strategy_name": strategy_names.get(config.strategy_id, f"策略{config.strategy_id}"),
            "stock_code": config.stock_code,
            "start_date": config.start_date,
            "end_date": config.end_date,
            "initial_capital": result['initial_capital'],
            "final_capital": round(result['final_capital'], 2),
            "total_return": round(result['total_return'], 4),
            "annual_return": round(result['annual_return'], 4),
            "sharpe_ratio": round(result['sharpe_ratio'], 4),
            "max_drawdown": round(result['max_drawdown'], 4),
            "win_rate": round(result['win_rate'], 4),
            "total_trades": result['total_trades'],
            "winning_trades": result['winning_trades'],
            "losing_trades": result['losing_trades'],
            "created_at": datetime.now().isoformat(),
            "chart": {
                "dates": dates,
                "kline": kline_chart,
                "indicator_lines": indicator_lines,
                "macd": macd_data,
                "buy_points": buy_points,
                "sell_points": sell_points,
                "equity_curve": {"dates": equity_dates, "values": equity_values},
                "volume": [int(row['volume']) for _, row in df.iterrows()]
            }
        }

        # 存储结果
        backtest_results_store.append(backtest_result)

        return {"message": "回测完成", "data": backtest_result}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[回测] 回测失败: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results")
async def get_backtest_results(limit: int = 10):
    """获取回测结果列表"""
    results = backtest_results_store[-limit:]
    return {"data": results, "count": len(results)}

@router.get("/results/{result_id}")
async def get_backtest_detail(result_id: int):
    """获取回测详情"""
    for result in backtest_results_store:
        if result['id'] == result_id:
            return {"data": result}
    raise HTTPException(status_code=404, detail="回测结果不存在")

@router.post("/optimize")
async def optimize_parameters(config: BacktestConfig):
    """参数优化 - 遍历不同参数组合"""
    try:
        kline_data = stock_data_provider.get_kline_data(
            stock_code=config.stock_code,
            period="daily",
            start_date=config.start_date,
            end_date=config.end_date
        )

        if not kline_data or len(kline_data) < 30:
            raise HTTPException(status_code=400, detail="K线数据不足")

        df = pd.DataFrame(kline_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)

        best_return = -999
        best_params = {}
        optimization_results = []

        # 遍历短期/长期均线参数组合
        for short_period in [3, 5, 7, 10]:
            for long_period in [15, 20, 30, 40]:
                if short_period >= long_period:
                    continue

                df_copy = df.copy()
                df_copy['ma_short'] = df_copy['close'].rolling(window=short_period).mean()
                df_copy['ma_long'] = df_copy['close'].rolling(window=long_period).mean()

                signals = pd.DataFrame(index=df_copy.index)
                signals['signal'] = 0
                prev_short = df_copy['ma_short'].shift(1)
                prev_long = df_copy['ma_long'].shift(1)
                signals.loc[(prev_short <= prev_long) & (df_copy['ma_short'] > df_copy['ma_long']), 'signal'] = 1
                signals.loc[(prev_short >= prev_long) & (df_copy['ma_short'] < df_copy['ma_long']), 'signal'] = -1

                engine = BacktestEngine(initial_capital=config.initial_capital)
                result = engine.run(df_copy, signals)

                optimization_results.append({
                    "short_period": short_period,
                    "long_period": long_period,
                    "total_return": round(result['total_return'], 4),
                    "sharpe_ratio": round(result['sharpe_ratio'], 4),
                    "max_drawdown": round(result['max_drawdown'], 4)
                })

                if result['total_return'] > best_return:
                    best_return = result['total_return']
                    best_params = {"short_period": short_period, "long_period": long_period}

        return {
            "message": "参数优化完成",
            "data": {
                "best_params": best_params,
                "best_return": round(best_return, 4),
                "optimization_results": optimization_results
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
