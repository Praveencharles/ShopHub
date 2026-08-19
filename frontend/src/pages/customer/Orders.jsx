import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiChevronRight, FiTrash2 } from 'react-icons/fi'
import { orderApi } from '../../api/orderApi'
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers'
import Loader from '../../components/common/Loader'
import Pagination from '../../components/common/Pagination'
import OrderStatusTracker from '../../components/common/OrderStatusTracker'
import toast from 'react-hot-toast'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deletingId, setDeletingId] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    orderApi.getOrders({ page }).then(({ data }) => {
      const results = data.results || data.data || data || []
      setOrders(Array.isArray(results) ? results : [])
      setTotalPages(Math.ceil((data.count || 0) / 10))
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [page])

  const handleDelete = async (e, orderId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Delete this cancelled order?')) return
    setDeletingId(orderId)
    try {
      await orderApi.deleteOrder(orderId)
      toast.success('Order deleted')
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch {
      toast.error('Failed to delete order')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <Loader />
  if (!orders.length) return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-center">
      <FiPackage size={40} className="mx-auto text-gray-300 mb-3 md:mb-4" />
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">No orders yet</h2>
      <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-6">Start shopping to see your orders here.</p>
      <Link to="/shop" className="btn-primary inline-flex text-sm md:text-base">Browse Products</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">My Orders</h1>
      <div className="space-y-3 md:space-y-4">
        {orders.map(order => (
          <Link key={order.id} to={`/orders/${order.id}`}
            className="card block hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between gap-2 md:gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                  <span className="font-medium text-gray-900 text-sm md:text-base">#{order.order_number || order.id}</span>
                  {order.payment_status && (
                    <span className={`badge ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">{formatDate(order.created_at)} · {order.items_count || order.items?.length || 0} items</p>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                <span className="font-bold text-gray-900 whitespace-nowrap text-sm md:text-base">{formatCurrency(order.grand_total || order.total_amount)}</span>
                {order.status === 'cancelled' ? (
                  <button onClick={(e) => handleDelete(e, order.id)} disabled={deletingId === order.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete order">
                    <FiTrash2 size={16} />
                  </button>
                ) : (
                  <FiChevronRight size={18} className="text-gray-300 group-hover:text-primary-600 transition-colors" />
                )}
              </div>
            </div>
            <div className="mt-2 md:mt-3">
              <OrderStatusTracker status={order.status} compact />
            </div>
          </Link>
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

export default Orders
