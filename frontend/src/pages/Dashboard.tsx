import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [marketIndices, setMarketIndices] = useState<any[]>([])
  const [portfolio, setPortfolio] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [indicesRes, portfolioRes] = await Promise.all([
        fetch('/api/market/index'),
        fetch('/api/portfolio/overview')
      ])
      const indicesData = await indicesRes.json()
      const portfolioData = await portfolioRes.json()
      
      setMarketIndices(indicesData.data || [])
      setPortfolio(portfolioData.data)
    } catch (error) {
      console.error('获取数据失败:', error)
    }
  }

  const equityCurveData = [
    { date: '01-01', value: 100000 },
    { date: '01-08', value: 105000 },
    { date: '01-15', value: 108000 },
    { date: '01-22', value: 112000 },
    { date: '01-29', value: 115000 },
    { date: '02-05', value: 118000 },
    { date: '02-12', value: 125000 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">控制台</h1>
        <p className="mt-1 text-sm text-gray-500">
          实时监控市场动态和投资组合表现
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总资产"
          value="¥150,000"
          change="+50.00%"
          isPositive={true}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatCard
          title="今日收益"
          value="¥2,000"
          change="+1.33%"
          isPositive={true}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard
          title="持仓市值"
          value="¥100,000"
          change="+12.00%"
          isPositive={true}
          icon={<Activity className="h-6 w-6" />}
        />
        <StatCard
          title="可用资金"
          value="¥50,000"
          change="-"
          isPositive={true}
          icon={<DollarSign className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">资产曲线</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={equityCurveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">大盘指数</h2>
          <div className="space-y-4">
            {marketIndices.length > 0 ? (
              marketIndices.map((index) => (
                <div key={index.code} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{index.name}</p>
                    <p className="text-sm text-gray-500">{index.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{index.price?.toFixed(2)}</p>
                    <p className={index.change_pct >= 0 ? 'stock-up' : 'stock-down'}>
                      {index.change_pct >= 0 ? '+' : ''}{index.change_pct?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <IndexItem name="上证指数" code="000001" price={3245.67} change={1.23} />
                <IndexItem name="深证成指" code="399001" price={10234.56} change={0.89} />
                <IndexItem name="创业板指" code="399006" price={2123.45} change={-0.45} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近交易</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">股票</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">价格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">数量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <TradeRow 
                time="2024-01-15 10:30" 
                stock="平安银行" 
                code="000001" 
                type="买入" 
                price={12.50} 
                quantity={1000} 
              />
              <TradeRow 
                time="2024-01-14 14:15" 
                stock="贵州茅台" 
                code="600519" 
                type="买入" 
                price={1680.00} 
                quantity={50} 
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change, isPositive, icon }: any) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {icon}
              </div>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {change !== '-' && (isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />)}
                  {change}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function IndexItem({ name, code, price, change }: any) {
  const isPositive = change >= 0
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{code}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{price.toFixed(2)}</p>
        <p className={isPositive ? 'stock-up' : 'stock-down'}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </p>
      </div>
    </div>
  )
}

function TradeRow({ time, stock, code, type, price, quantity }: any) {
  const amount = price * quantity
  const isBuy = type === '买入'
  
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{time}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{stock}</div>
        <div className="text-sm text-gray-500">{code}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isBuy ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{price.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quantity}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{amount.toFixed(2)}</td>
    </tr>
  )
}
