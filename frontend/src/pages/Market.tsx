import { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Market() {
  const [searchTerm, setSearchTerm] = useState('')
  const [hotStocks, setHotStocks] = useState<any[]>([])
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [klineData, setKlineData] = useState<any[]>([])

  useEffect(() => {
    fetchHotStocks()
  }, [])

  const fetchHotStocks = async () => {
    try {
      const response = await fetch('/api/market/hot?limit=20')
      const data = await response.json()
      setHotStocks(data.data || [])
    } catch (error) {
      console.error('获取热门股票失败:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm) return
    
    try {
      const response = await fetch(`/api/market/stocks/search?keyword=${searchTerm}`)
      const data = await response.json()
      console.log('搜索结果:', data)
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }

  const handleStockClick = async (stock: any) => {
    setSelectedStock(stock)
    
    try {
      const response = await fetch(`/api/market/stocks/${stock.code}/kline?period=daily`)
      const data = await response.json()
      setKlineData(data.data || [])
    } catch (error) {
      console.error('获取K线数据失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">市场行情</h1>
        <p className="mt-1 text-sm text-gray-500">
          实时查看股票行情和技术分析
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="输入股票代码或名称搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Search size={18} />
            搜索
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">热门股票</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {hotStocks.length > 0 ? (
              hotStocks.map((stock) => (
                <button
                  key={stock.code}
                  onClick={() => handleStockClick(stock)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{stock.name}</p>
                        <p className="text-sm text-gray-500">{stock.code}</p>
                      </div>
                      {stock.is_mock && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          MOCK
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">¥{stock.price?.toFixed(2)}</p>
                      <p className={stock.change_pct >= 0 ? 'stock-up' : 'stock-down'}>
                        {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">加载中...</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          {selectedStock ? (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStock.name}</h2>
                    <p className="text-sm text-gray-500">{selectedStock.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">¥{selectedStock.price?.toFixed(2)}</p>
                    <div className={`flex items-center justify-end gap-1 ${selectedStock.change_pct >= 0 ? 'stock-up' : 'stock-down'}`}>
                      {selectedStock.change_pct >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span>{selectedStock.change_pct >= 0 ? '+' : ''}{selectedStock.change_pct?.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">K线图</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={klineData.slice(-60)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="close" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <InfoItem label="开盘" value={`¥${selectedStock.price?.toFixed(2)}`} />
                <InfoItem label="最高" value={`¥${selectedStock.price?.toFixed(2)}`} />
                <InfoItem label="最低" value={`¥${selectedStock.price?.toFixed(2)}`} />
                <InfoItem label="成交量" value="1.2亿" />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-gray-500">
              <p>请选择一只股票查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  )
}
