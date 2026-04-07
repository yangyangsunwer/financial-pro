from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class Strategy(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    code: str
    parameters: dict
    created_at: Optional[str] = None

class StrategyCreate(BaseModel):
    name: str
    description: str
    code: str
    parameters: dict

@router.get("/list")
async def list_strategies():
    """获取策略列表"""
    strategies = [
        {
            "id": 1,
            "name": "双均线策略",
            "description": "基于短期和长期均线交叉的经典策略",
            "type": "趋势跟踪",
            "status": "active"
        },
        {
            "id": 2,
            "name": "MACD金叉策略",
            "description": "MACD指标金叉买入，死叉卖出",
            "type": "技术指标",
            "status": "active"
        },
        {
            "id": 3,
            "name": "网格交易策略",
            "description": "在价格区间内设置网格进行高抛低吸",
            "type": "套利",
            "status": "draft"
        }
    ]
    return {"data": strategies, "count": len(strategies)}

@router.get("/{strategy_id}")
async def get_strategy(strategy_id: int):
    """获取策略详情"""
    if strategy_id == 1:
        return {
            "data": {
                "id": 1,
                "name": "双均线策略",
                "description": "基于短期和长期均线交叉的经典策略",
                "code": """
def strategy(data, short_period=5, long_period=20):
    # 计算短期和长期均线
    data['ma_short'] = data['close'].rolling(window=short_period).mean()
    data['ma_long'] = data['close'].rolling(window=long_period).mean()
    
    # 生成交易信号
    data['signal'] = 0
    data.loc[data['ma_short'] > data['ma_long'], 'signal'] = 1  # 买入
    data.loc[data['ma_short'] < data['ma_long'], 'signal'] = -1  # 卖出
    
    return data
                """,
                "parameters": {
                    "short_period": 5,
                    "long_period": 20
                },
                "created_at": "2024-01-01"
            }
        }
    raise HTTPException(status_code=404, detail="策略不存在")

@router.post("/create")
async def create_strategy(strategy: StrategyCreate):
    """创建新策略"""
    return {
        "message": "策略创建成功",
        "data": {
            "id": 4,
            **strategy.dict()
        }
    }

@router.put("/{strategy_id}")
async def update_strategy(strategy_id: int, strategy: StrategyCreate):
    """更新策略"""
    return {
        "message": "策略更新成功",
        "data": {
            "id": strategy_id,
            **strategy.dict()
        }
    }

@router.delete("/{strategy_id}")
async def delete_strategy(strategy_id: int):
    """删除策略"""
    return {"message": "策略删除成功"}

@router.get("/templates/list")
async def list_strategy_templates():
    """获取策略模板"""
    templates = [
        {
            "id": "ma_cross",
            "name": "双均线策略",
            "description": "短期均线上穿长期均线买入，下穿卖出",
            "difficulty": "初级"
        },
        {
            "id": "macd",
            "name": "MACD策略",
            "description": "MACD金叉买入，死叉卖出",
            "difficulty": "初级"
        },
        {
            "id": "kdj",
            "name": "KDJ超买超卖",
            "description": "KDJ指标判断超买超卖区域",
            "difficulty": "中级"
        },
        {
            "id": "grid",
            "name": "网格交易",
            "description": "在价格区间内设置网格进行交易",
            "difficulty": "中级"
        },
        {
            "id": "mean_reversion",
            "name": "均值回归",
            "description": "价格偏离均值时进行反向交易",
            "difficulty": "高级"
        }
    ]
    return {"data": templates}
