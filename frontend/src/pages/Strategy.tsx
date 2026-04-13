import { useState, useEffect } from 'react'
import { Plus, Play, Edit, Trash2 } from 'lucide-react'
import BacktestChart from './BacktestChart'

export default function Strategy() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: ''
  })
  const [templates, setTemplates] = useState<any[]>([])
  const [showBacktestDialog, setShowBacktestDialog] = useState(false)
  const [backtestStrategyId, setBacktestStrategyId] = useState<number | null>(null)
  const [backtestParams, setBacktestParams] = useState({
    stock_code: '000001',
    start_date: '20250101',
    end_date: '20260401',
    initial_capital: 100000
  })
  const [backtestLoading, setBacktestLoading] = useState(false)
  const [backtestResult, setBacktestResult] = useState<any>(null)

  useEffect(() => {
    fetchStrategies()
    fetchTemplates()
  }, [])

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/strategy/list')
      const data = await response.json()
      setStrategies(data.data || [])
    } catch (error) {
      console.error('获取策略列表失败:', error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/strategy/templates/list')
      const data = await response.json()
      setTemplates(data.data || [])
    } catch (error) {
      console.error('获取策略模板失败:', error)
    }
  }

  const handleCreateStrategy = async () => {
    try {
      const selectedTemplate = templates.find(t => t.id === formData.template)
      const defaultCode = selectedTemplate ? getDefaultCode(formData.template) : getDefaultCode('ma_cross')

      const response = await fetch('/api/strategy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          code: defaultCode,
          parameters: {}
        })
      })
      await response.json()
      alert('策略创建成功！')
      setShowCreateDialog(false)
      setFormData({ name: '', description: '', template: '' })
      fetchStrategies()
    } catch (error) {
      console.error('创建策略失败:', error)
      alert('创建策略失败，请重试')
    }
  }

  const getDefaultCode = (templateId: string) => {
    const codes: Record<string, string> = {
      'ma_cross': `def strategy(data, short_period=5, long_period=20):
    # 计算短期和长期均线
    data['ma_short'] = data['close'].rolling(window=short_period).mean()
    data['ma_long'] = data['close'].rolling(window=long_period).mean()
    
    # 生成交易信号
    data['signal'] = 0
    data.loc[data['ma_short'] > data['ma_long'], 'signal'] = 1  # 买入
    data.loc[data['ma_short'] < data['ma_long'], 'signal'] = -1  # 卖出
    
    return data`,
      'macd': `def strategy(data, fast_period=12, slow_period=26, signal_period=9):
    # 计算 MACD
    data['ema_fast'] = data['close'].ewm(span=fast_period).mean()
    data['ema_slow'] = data['close'].ewm(span=slow_period).mean()
    data['macd'] = data['ema_fast'] - data['ema_slow']
    data['signal_line'] = data['macd'].ewm(span=signal_period).mean()
    data['histogram'] = data['macd'] - data['signal_line']
    
    # 生成交易信号
    data['signal'] = 0
    data.loc[(data['macd'] > data['signal_line']) & (data['macd'].shift(1) <= data['signal_line'].shift(1)), 'signal'] = 1  # 金叉买入
    data.loc[(data['macd'] < data['signal_line']) & (data['macd'].shift(1) >= data['signal_line'].shift(1)), 'signal'] = -1  # 死叉卖出
    
    return data`,
      'kdj': `def strategy(data, n=9, m1=3, m2=3):
    # 计算 KDJ
    low_list = data['low'].rolling(window=n).min()
    high_list = data['high'].rolling(window=n).max()
    rsv = (data['close'] - low_list) / (high_list - low_list) * 100
    data['K'] = rsv.ewm(com=m1-1).mean()
    data['D'] = data['K'].ewm(com=m2-1).mean()
    data['J'] = 3 * data['K'] - 2 * data['D']
    
    # 生成交易信号
    data['signal'] = 0
    data.loc[(data['K'] < 20) & (data['D'] < 20), 'signal'] = 1  # 超卖买入
    data.loc[(data['K'] > 80) & (data['D'] > 80), 'signal'] = -1  # 超买卖出
    
    return data`,
      'grid': `def strategy(data, grid_count=10, grid_range=0.1):
    # 网格交易策略
    price_range = data['close'].max() - data['close'].min()
    grid_size = price_range / grid_count
    base_price = data['close'].min()
    
    data['signal'] = 0
    for i in range(grid_count):
      upper_price = base_price + (i + 1) * grid_size
      lower_price = base_price + i * grid_size
      data.loc[(data['close'] >= lower_price) & (data['close'] < upper_price), 'signal'] = 1 if i % 2 == 0 else -1
    
    return data`,
      'mean_reversion': `def strategy(data, window=20, std_dev=2):
    # 均值回归策略
    data['mean'] = data['close'].rolling(window=window).mean()
    data['std'] = data['close'].rolling(window=window).std()
    data['upper_band'] = data['mean'] + std_dev * data['std']
    data['lower_band'] = data['mean'] - std_dev * data['std']
    
    # 生成交易信号
    data['signal'] = 0
    data.loc[data['close'] < data['lower_band'], 'signal'] = 1  # 价格低于下轨买入
    data.loc[data['close'] > data['upper_band'], 'signal'] = -1  # 价格高于上轨卖出
    
    return data`
    }
    return codes[templateId] || codes['ma_cross']
  }

  const openBacktestDialog = (strategyId: number) => {
    setBacktestStrategyId(strategyId)
    setShowBacktestDialog(true)
  }

  const handleRunBacktest = async () => {
    if (!backtestStrategyId) return
    setBacktestLoading(true)
    try {
      const response = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_id: backtestStrategyId,
          stock_code: backtestParams.stock_code,
          start_date: backtestParams.start_date,
          end_date: backtestParams.end_date,
          initial_capital: backtestParams.initial_capital
        })
      })
      const data = await response.json()
      if (data.data && data.data.chart) {
        setBacktestResult(data.data)
        setShowBacktestDialog(false)
      } else {
        alert(`回测失败: ${data.detail || '未知错误'}`)
      }
    } catch (error) {
      console.error('运行回测失败:', error)
      alert('运行回测失败，请检查后端服务')
    } finally {
      setBacktestLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">策略中心</h1>
          <p className="mt-1 text-sm text-gray-500">
            创建、管理和回测你的交易策略
          </p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={18} />
          创建策略
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy)}
              className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                selectedStrategy?.id === strategy.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{strategy.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{strategy.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  strategy.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {strategy.status === 'active' ? '活跃' : '草稿'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openBacktestDialog(strategy.id)
                  }}
                  className="flex-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 flex items-center justify-center gap-1"
                >
                  <Play size={14} />
                  回测
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600">
                  <Edit size={16} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          {selectedStrategy ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedStrategy.name}</h2>
                <p className="text-gray-600 mt-2">{selectedStrategy.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">策略代码</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
                    <code>{`def strategy(data, short_period=5, long_period=20):
    # 计算短期和长期均线
    data['ma_short'] = data['close'].rolling(window=short_period).mean()
    data['ma_long'] = data['close'].rolling(window=long_period).mean()
    
    # 生成交易信号
    data['signal'] = 0
    data.loc[data['ma_short'] > data['ma_long'], 'signal'] = 1  # 买入
    data.loc[data['ma_short'] < data['ma_long'], 'signal'] = -1  # 卖出
    
    return data`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">策略参数</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      短期周期
                    </label>
                    <input
                      type="number"
                      defaultValue={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      长期周期
                    </label>
                    <input
                      type="number"
                      defaultValue={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  保存策略
                </button>
                <button
                  onClick={() => openBacktestDialog(selectedStrategy.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  运行回测
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-gray-500">
              <p>请选择一个策略查看详情</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">策略模板</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TemplateCard
            title="双均线策略"
            description="短期均线上穿长期均线买入，下穿卖出"
            difficulty="初级"
          />
          <TemplateCard
            title="MACD策略"
            description="MACD金叉买入，死叉卖出"
            difficulty="初级"
          />
          <TemplateCard
            title="网格交易"
            description="在价格区间内设置网格进行交易"
            difficulty="中级"
          />
        </div>
      </div>

      {/* 回测结果图表 */}
      {backtestResult && (
        <BacktestChart
          data={backtestResult}
          onClose={() => setBacktestResult(null)}
        />
      )}

      {/* 回测参数弹窗 */}
      {showBacktestDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">回测参数设置</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  股票代码
                </label>
                <input
                  type="text"
                  value={backtestParams.stock_code}
                  onChange={(e) => setBacktestParams({ ...backtestParams, stock_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="例如: 000001（平安银行）、600519（贵州茅台）"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    开始日期
                  </label>
                  <input
                    type="text"
                    value={backtestParams.start_date}
                    onChange={(e) => setBacktestParams({ ...backtestParams, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="如 20250101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    结束日期
                  </label>
                  <input
                    type="text"
                    value={backtestParams.end_date}
                    onChange={(e) => setBacktestParams({ ...backtestParams, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="如 20260401"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  初始资金（元）
                </label>
                <input
                  type="number"
                  value={backtestParams.initial_capital}
                  onChange={(e) => setBacktestParams({ ...backtestParams, initial_capital: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowBacktestDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleRunBacktest}
                disabled={backtestLoading || !backtestParams.stock_code}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {backtestLoading ? '回测中...' : '开始回测'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 创建策略模态框 */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">创建新策略</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  策略名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="输入策略名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  策略描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="输入策略描述"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择模板
                </label>
                <select
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">-- 选择策略模板 --</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.difficulty}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateStrategy}
                disabled={!formData.name || !formData.description}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ title, description, difficulty }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          {difficulty}
        </span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <button className="mt-3 w-full px-3 py-1.5 border border-primary-600 text-primary-600 rounded hover:bg-primary-50 text-sm">
        使用模板
      </button>
    </div>
  )
}
