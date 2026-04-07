import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function Portfolio() {
  const [positions, setPositions] = useState<any[]>([])
  const [overview, setOverview] = useState<any>(null)

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  const fetchPortfolioData = async () => {
    try {
      const [positionsRes, overviewRes] = await Promise.all([
        fetch('/api/portfolio/positions'),
        fetch('/api/portfolio/overview')
      ])
      const positionsData = await positionsRes.json()
      const overviewData = await overviewRes.json()
      
      setPositions(positionsData.data || [])
      setOverview(overviewData.data)
    } catch (error) {
      console.error('获取投资组合数据失败:', error)
    }
  }

  const pieData = positions.map(pos => ({
    name: pos.stock_name,
    value: pos.market_value
  }))

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">投资组合</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理你的持仓和查看投资绩效
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="总资产"
          value="¥150,000"
          subtitle="可用资金: ¥50,000"
        />
        <MetricCard
          title="持仓市值"
          value="¥100,000"
          subtitle="2只股票"
        />
        <MetricCard
          title="总收益"
          value="¥50,000"
          subtitle="+50.00%"
          isPositive={true}
        />
        <MetricCard
          title="今日收益"
          value="¥2,000"
          subtitle="+1.33%"
          isPositive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">持仓分布</h2>
          {positions.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>暂无持仓</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">持仓明细</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">股票</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">持仓</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">成本价</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">现价</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">市值</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">盈亏</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {positions.length > 0 ? (
                  positions.map((position) => (
                    <tr key={position.stock_code}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{position.stock_name}</div>
                        <div className="text-sm text-gray-500">{position.stock_code}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.quantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{position.avg_price?.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{position.current_price?.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{position.market_value?.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={position.profit_loss >= 0 ? 'stock-up' : 'stock-down'}>
                          <div className="flex items-center gap-1">
                            {position.profit_loss >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>¥{position.profit_loss?.toFixed(2)}</span>
                          </div>
                          <div className="text-sm">
                            {position.profit_loss_pct >= 0 ? '+' : ''}{(position.profit_loss_pct * 100)?.toFixed(2)}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      暂无持仓数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">绩效指标</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <PerformanceMetric label="总收益率" value="50.00%" />
          <PerformanceMetric label="年化收益率" value="35.00%" />
          <PerformanceMetric label="夏普比率" value="1.80" />
          <PerformanceMetric label="最大回撤" value="-15.00%" />
          <PerformanceMetric label="胜率" value="62.00%" />
          <PerformanceMetric label="盈亏比" value="2.10" />
          <PerformanceMetric label="总交易次数" value="120" />
          <PerformanceMetric label="盈利次数" value="74" />
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, isPositive }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className={`text-sm ${isPositive !== undefined ? (isPositive ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
        {subtitle}
      </p>
    </div>
  )
}

function PerformanceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
