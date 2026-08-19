import { useState, useEffect } from 'react'
import { orderApi } from '../../api/orderApi'
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import Pagination from '../../components/common/Pagination'
import Dropdown from '../../components/common/Dropdown'

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    const params = { page, page_size: 10 }
    if (statusFilter) params.status = statusFilter
    orderApi.getOrders(params).then(({ data }) => {
      setOrders(data.results || data.data || data || [])
      setTotalPages(Math.ceil((data.count || 0) / 10))
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [page, statusFilter])

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await orderApi.updateOrderStatus(orderId, { status })
      toast.success(`Order #${orderId} updated to ${status}`)
      fetchOrders()
    } catch { toast.error('Failed to update status') }
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="w-48">
          <Dropdown value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }}
            placeholder="All Statuses"
            options={statuses.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
        </div>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="card !p-0">
            <div className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium text-gray-900">#{order.order_number || order.id}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                {order.payment_status && <span className={`badge ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span>}
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-gray-900">{formatCurrency(order.grand_total || order.total_amount)}</p>
                <span className="text-xs text-gray-400">{(order.items_count || order.items?.length || 0)} items</span>
              </div>
            </div>

            {expanded === order.id && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                {/* Customer Info */}
                {order.user && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900">{order.user.username || order.user.email}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Items</p>
                  <div className="space-y-2">
                    {(order.items || []).map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-900">{item.product?.name || item.name} × {item.quantity}</span>
                        <span className="text-gray-700">{formatCurrency(item.total || item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Update status:</span>
                    <div className="w-44">
                      <Dropdown onChange={(val) => handleStatusUpdate(order.id, val)}
                        placeholder="Select..."
                        options={statuses.filter(s => s !== 'cancelled').map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {!orders.length && <p className="text-gray-500 text-center py-8">No orders found</p>}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

export default AdminOrders
