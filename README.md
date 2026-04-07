# A股量化交易系统

一个功能完整的A股量化交易系统，支持策略回测、实时监控、模拟交易。

## 技术栈

### 前端
- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- Recharts (数据可视化)
- Zustand (状态管理)
- React Query (数据获取)

### 后端
- FastAPI (Python 异步框架)
- pandas + numpy (数据分析)
- backtrader (回测引擎)
- akshare (A股数据源)
- SQLAlchemy + PostgreSQL (数据存储)
- Redis (缓存)

## 核心功能

### 第一阶段：数据与回测
- [x] 项目初始化
- [ ] A股实时/历史数据获取
- [ ] K线图可视化
- [ ] 技术指标计算（MA、MACD、KDJ、RSI等）
- [ ] 策略回测引擎
- [ ] 回测结果分析

### 第二阶段：策略开发
- [ ] 策略编辑器
- [ ] 常用策略模板（双均线、网格、趋势跟踪）
- [ ] 参数优化工具
- [ ] 策略组合管理

### 第三阶段：风控与执行
- [ ] 风险管理模块
- [ ] 仓位管理系统
- [ ] 模拟交易环境
- [ ] 实时监控面板

### 第四阶段：实盘对接
- [ ] 券商API集成
- [ ] 订单管理系统
- [ ] 交易日志与分析
- [ ] 收益统计报表

## 快速开始

### 后端启动
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 前端启动
```bash
cd frontend
npm install
npm start
```

## 项目结构

```
quant-trading-system/
├── backend/                 # Python后端
│   ├── main.py             # FastAPI入口
│   ├── api/                # API路由
│   ├── core/               # 核心业务逻辑
│   │   ├── data/           # 数据获取
│   │   ├── strategy/       # 策略引擎
│   │   ├── backtest/       # 回测引擎
│   │   └── risk/           # 风控模块
│   ├── models/             # 数据模型
│   ├── utils/              # 工具函数
│   └── requirements.txt    # Python依赖
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # UI组件
│   │   ├── pages/          # 页面
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── store/          # 状态管理
│   │   └── utils/          # 工具函数
│   └── package.json
└── README.md
```

## 学习路径

### 技术成长
1. **FastAPI异步编程** - 高性能API开发
2. **金融数据处理** - pandas时序数据分析
3. **算法交易策略** - 量化策略设计与实现
4. **系统架构设计** - 微服务、缓存、消息队列

### 金融知识
1. **技术分析基础** - K线、均线、MACD等指标
2. **量化策略** - 趋势跟踪、均值回归、套利策略
3. **风险管理** - 仓位控制、止损止盈、资金管理
4. **交易心理** - 纪律性、情绪控制

## 注意事项

⚠️ **风险提示**
- 本系统仅供学习和研究使用
- 量化交易存在风险，历史收益不代表未来表现
- 实盘交易前请充分测试，建议从小资金开始
- 遵守相关法律法规，不进行内幕交易等违法行为

## License

MIT
