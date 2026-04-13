import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface ChartData {
  dates: string[]
  kline: number[][]
  indicator_lines: { name: string; color: string; data: (number | null)[] }[]
  macd?: { dif: (number | null)[]; dea: (number | null)[]; hist: (number | null)[] } | null
  buy_points: { date: string; price: number }[]
  sell_points: { date: string; price: number }[]
  equity_curve: { dates: string[]; values: number[] }
  volume: number[]
}

interface BacktestResult {
  strategy_name: string
  stock_code: string
  total_return: number
  annual_return: number
  sharpe_ratio: number
  max_drawdown: number
  win_rate: number
  total_trades: number
  initial_capital: number
  final_capital: number
  chart: ChartData
}

interface Props {
  data: BacktestResult
  onClose: () => void
}

export default function BacktestChart({ data, onClose }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || !data.chart) return

    const chart = echarts.init(chartRef.current)
    const { dates, kline, indicator_lines, buy_points, sell_points, equity_curve, volume } = data.chart

    // 买卖点散点数据
    const buyScatter = buy_points.map(p => [p.date, p.price])
    const sellScatter = sell_points.map(p => [p.date, p.price])

    // K线图 series
    const series: any[] = [
      {
        name: 'K线',
        type: 'candlestick',
        data: kline,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: {
          color: '#ef5350',
          color0: '#26a69a',
          borderColor: '#ef5350',
          borderColor0: '#26a69a'
        }
      },
      // 成交量
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volume,
        itemStyle: {
          color: (params: any) => {
            const idx = params.dataIndex
            if (kline[idx] && kline[idx][1] >= kline[idx][0]) {
              return '#ef5350'
            }
            return '#26a69a'
          }
        }
      },
      // 资金曲线
      {
        name: '资金曲线',
        type: 'line',
        xAxisIndex: 2,
        yAxisIndex: 2,
        data: equity_curve.values,
        smooth: true,
        lineStyle: { color: '#7c4dff', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(124,77,255,0.3)' },
            { offset: 1, color: 'rgba(124,77,255,0.05)' }
          ])
        },
        itemStyle: { color: '#7c4dff' },
        symbol: 'none'
      },
      // 买入点
      {
        name: '买入',
        type: 'scatter',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: buyScatter,
        symbol: 'triangle',
        symbolSize: 14,
        itemStyle: { color: '#ff1744' },
        label: {
          show: true,
          position: 'bottom',
          formatter: 'B',
          fontSize: 10,
          fontWeight: 'bold',
          color: '#ff1744'
        },
        z: 10
      },
      // 卖出点
      {
        name: '卖出',
        type: 'scatter',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: sellScatter,
        symbol: 'pin',
        symbolSize: 14,
        symbolRotate: 180,
        itemStyle: { color: '#00c853' },
        label: {
          show: true,
          position: 'top',
          formatter: 'S',
          fontSize: 10,
          fontWeight: 'bold',
          color: '#00c853'
        },
        z: 10
      }
    ]

    // 指标线
    indicator_lines.forEach(line => {
      series.push({
        name: line.name,
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: line.data,
        smooth: true,
        lineStyle: { color: line.color, width: 1.5 },
        itemStyle: { color: line.color },
        symbol: 'none'
      })
    })

    const option: echarts.EChartsOption = {
      backgroundColor: '#fff',
      animation: false,
      legend: {
        top: 10,
        left: 'center',
        data: ['K线', '买入', '卖出', ...indicator_lines.map(l => l.name), '资金曲线']
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }]
      },
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1, 2], start: 0, end: 100 },
        { type: 'slider', xAxisIndex: [0, 1, 2], bottom: 10, start: 0, end: 100, height: 20 }
      ],
      grid: [
        { left: 60, right: 60, top: 50, height: '40%' },
        { left: 60, right: 60, top: '58%', height: '12%' },
        { left: 60, right: 60, top: '75%', height: '14%' }
      ],
      xAxis: [
        { type: 'category', data: dates, gridIndex: 0, boundaryGap: true, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false } },
        { type: 'category', data: dates, gridIndex: 1, boundaryGap: true, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false } },
        { type: 'category', data: dates, gridIndex: 2, boundaryGap: true, axisLabel: { fontSize: 10 } }
      ],
      yAxis: [
        { scale: true, gridIndex: 0, splitLine: { lineStyle: { color: '#f0f0f0' } } },
        { scale: true, gridIndex: 1, splitLine: { show: false }, axisLabel: { show: false } },
        { scale: true, gridIndex: 2, splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { fontSize: 10 } }
      ],
      series
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [data])

  const r = data

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-[1200px] max-h-[92vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {r.strategy_name} - {r.stock_code} 回测结果
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* 指标卡片 */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 px-6 py-3 bg-gray-50 border-b text-center">
          <div>
            <div className="text-xs text-gray-500">总收益率</div>
            <div className={`text-sm font-bold ${r.total_return >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {(r.total_return * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">年化收益</div>
            <div className={`text-sm font-bold ${r.annual_return >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {(r.annual_return * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">夏普比率</div>
            <div className="text-sm font-bold text-gray-900">{r.sharpe_ratio.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">最大回撤</div>
            <div className="text-sm font-bold text-green-600">{(r.max_drawdown * 100).toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">胜率</div>
            <div className="text-sm font-bold text-gray-900">{(r.win_rate * 100).toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">交易次数</div>
            <div className="text-sm font-bold text-gray-900">{r.total_trades}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">初始资金</div>
            <div className="text-sm font-bold text-gray-900">{r.initial_capital.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">最终资金</div>
            <div className={`text-sm font-bold ${r.final_capital >= r.initial_capital ? 'text-red-600' : 'text-green-600'}`}>
              {r.final_capital.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 图表 */}
        <div className="flex-1 min-h-0 px-4 py-2">
          <div ref={chartRef} className="w-full h-full" style={{ minHeight: '500px' }} />
        </div>
      </div>
    </div>
  )
}
