import { useState, useEffect } from 'react'
import { Plus, Play, Edit, Trash2 } from 'lucide-react'

export default function Strategy() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null)

  useEffect(() => {
    fetchStrategies()
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

  const handleRunBacktest = async (strategyId: number) => {
    try {
      const response = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_id: strategyId,
          stock_code: '000001',
          start_date: '20230101',
          end_date: '20231231',
          initial_capital: 100000
        })
      })
      const data = await response.json()
      alert(`回测完成！总收益率: ${(data.data.total_return * 100).toFixed(2)}%`)
    } catch (error) {
      console.error('运行回测失败:', error)
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
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
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
                    handleRunBacktest(strategy.id)
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
                  onClick={() => handleRunBacktest(selectedStrategy.id)}
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
