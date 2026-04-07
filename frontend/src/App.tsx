import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, LineChart, Wallet, Settings } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Market from './pages/Market'
import Strategy from './pages/Strategy'
import Portfolio from './pages/Portfolio'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    量化交易系统
                  </span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <NavLink to="/" icon={<LayoutDashboard size={18} />}>
                    控制台
                  </NavLink>
                  <NavLink to="/market" icon={<LineChart size={18} />}>
                    市场行情
                  </NavLink>
                  <NavLink to="/strategy" icon={<TrendingUp size={18} />}>
                    策略中心
                  </NavLink>
                  <NavLink to="/portfolio" icon={<Wallet size={18} />}>
                    投资组合
                  </NavLink>
                </div>
              </div>
              <div className="flex items-center">
                <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                  <Settings size={20} />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market" element={<Market />} />
            <Route path="/strategy" element={<Strategy />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function NavLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
    >
      <span className="mr-1">{icon}</span>
      {children}
    </Link>
  )
}

export default App
