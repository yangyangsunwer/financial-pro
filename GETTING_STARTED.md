# 快速开始指南

欢迎使用A股量化交易系统！这个指南将帮助你快速上手。

## 第一步：安装依赖

### 后端依赖（Python）

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 前端依赖（Node.js）

```bash
cd frontend
npm install
```

## 第二步：启动系统

### 方法1：使用启动脚本（推荐）

```bash
./start.sh
```

### 方法2：手动启动

**启动后端：**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**启动前端（新终端）：**
```bash
cd frontend
npm run dev
```

## 第三步：访问系统

- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

## 核心功能介绍

### 1. 控制台（Dashboard）
- 查看投资组合总览
- 实时资产曲线
- 大盘指数监控
- 最近交易记录

### 2. 市场行情（Market）
- 搜索股票
- 查看实时行情
- K线图分析
- 热门股票排行

### 3. 策略中心（Strategy）
- 创建交易策略
- 策略回测
- 参数优化
- 策略模板库

### 4. 投资组合（Portfolio）
- 持仓管理
- 收益分析
- 交易历史
- 绩效指标

## 学习路径

### 第一周：熟悉系统
1. 浏览各个页面，了解功能布局
2. 搜索几只股票，查看行情数据
3. 尝试运行预设的双均线策略回测

### 第二周：策略开发
1. 学习双均线策略的代码
2. 修改参数，观察回测结果变化
3. 尝试创建自己的简单策略

### 第三周：深入学习
1. 学习更多技术指标（MACD、KDJ、RSI）
2. 研究不同类型的策略（趋势、均值回归、网格）
3. 优化策略参数，提高收益率

### 第四周：实战准备
1. 完善风险管理规则
2. 设置止损止盈
3. 进行模拟交易测试

## 常见问题

### Q: 如何获取更多历史数据？
A: 系统默认使用akshare获取数据。如需更多数据源，可以注册Tushare账号，获取token后配置到`.env`文件。

### Q: 回测结果不理想怎么办？
A: 
1. 检查策略逻辑是否合理
2. 尝试不同的参数组合
3. 考虑加入更多过滤条件
4. 注意过拟合问题

### Q: 如何添加新的技术指标？
A: 在`backend/core/strategy/`目录下创建新的策略类，继承`BaseStrategy`基类。

### Q: 系统支持实盘交易吗？
A: 当前版本主要用于学习和回测。实盘交易需要集成券商API，建议先在模拟盘充分测试。

## 技术成长建议

### Python方面
- 学习pandas数据处理
- 掌握numpy数值计算
- 了解异步编程（asyncio）

### JavaScript方面
- 深入React Hooks
- 学习状态管理（Zustand）
- 掌握数据可视化（Recharts）

### 金融知识
- 技术分析基础
- 风险管理原理
- 量化策略类型
- 交易心理学

## 下一步计划

1. **完善数据层**
   - 添加更多数据源
   - 实现数据缓存
   - 优化数据获取速度

2. **增强策略引擎**
   - 支持更多技术指标
   - 实现策略组合
   - 添加机器学习策略

3. **优化用户体验**
   - 添加更多图表类型
   - 实现实时数据推送
   - 优化移动端适配

4. **风控系统**
   - 实现仓位管理
   - 添加风险预警
   - 完善止损机制

## 学习资源

### 推荐书籍
- 《Python金融大数据分析》
- 《量化投资：以Python为工具》
- 《海龟交易法则》

### 在线资源
- AKShare文档: https://akshare.akfamily.xyz/
- Backtrader文档: https://www.backtrader.com/
- 聚宽量化课堂: https://www.joinquant.com/

## 注意事项

⚠️ **重要提醒**
1. 本系统仅供学习研究使用
2. 历史收益不代表未来表现
3. 实盘交易需谨慎，建议从小资金开始
4. 遵守相关法律法规，不进行违法交易
5. 保护好个人账户信息和API密钥

## 获取帮助

如果遇到问题：
1. 查看README.md文档
2. 检查后端日志输出
3. 查看浏览器控制台错误
4. 参考API文档 http://localhost:8000/docs

祝你在量化交易的学习之路上收获满满！💰📈
