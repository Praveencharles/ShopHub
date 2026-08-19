import { useState, useEffect } from 'react'
import { FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiTrendingUp, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { dashboardApi } from '../../api/dashboardApi'
import { formatCurrency } from '../../utils/helpers'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import Loader from '../../components/common/Loader'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getRevenue(),
    ]).then(([statsRes, revRes]) => {
      setStats(statsRes.data.data || statsRes.data)
      setRevenue(revRes.data.data || revRes.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (!stats) return <p className="text-gray-500">Failed to load dashboard</p>

  const chartData = {
    labels: revenue.map(r => r.label || r.date || ''),
    datasets: [{
      label: 'Revenue',
      data: revenue.map(r => r.value || r.revenue || r.amount || 0),
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } },
  }

  const cards = [
    { icon: FiDollarSign, label: 'Total Revenue', value: formatCurrency(stats.total_revenue || 0), change: '+12.5%', up: true, color: 'bg-green-500' },
    { icon: FiShoppingBag, label: 'Total Orders', value: stats.total_orders || 0, change: '+8.2%', up: true, color: 'bg-blue-500' },
    { icon: FiUsers, label: 'Total Customers', value: stats.total_customers || 0, change: '+5.1%', up: true, color: 'bg-purple-500' },
    { icon: FiPackage, label: 'Total Products', value: stats.total_products || 0, change: '+3.7%', up: true, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="card min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <card.icon size={20} className="text-white" />
              </div>
              {card.change && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${card.up ? 'text-green-600' : 'text-red-600'}`}>
                  {card.up ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}{card.change}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiTrendingUp className="text-primary-600" /> Revenue Overview</h2>
          {revenue.length > 0 ? (
            <div className="h-64"><Line data={chartData} options={chartOptions} /></div>
          ) : (
            <p className="text-gray-400 text-sm py-12 text-center">No revenue data available</p>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Pending Orders</span><span className="font-semibold text-gray-900">{stats.pending_orders || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Low Stock Items</span><span className="font-semibold text-yellow-600">{stats.low_stock_count || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Out of Stock</span><span className="font-semibold text-red-600">{stats.out_of_stock_count || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Avg Order Value</span><span className="font-semibold text-gray-900">{formatCurrency(stats.average_order_value || 0)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
