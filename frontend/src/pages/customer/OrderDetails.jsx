import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiPackage, FiMapPin, FiCreditCard, FiArrowLeft, FiXCircle, FiTrash2 } from 'react-icons/fi'
import { orderApi } from '../../api/orderApi'
import { formatCurrency, formatDate, getStatusColor, getProductImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import OrderStatusTracker from '../../components/common/OrderStatusTracker'

const OrderDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    orderApi.getOrder(id).then(({ data }) => setOrder(data.data || data)).catch(() => {
      toast.error('Order not found'); navigate('/orders')
    }).finally(() => setLoading(false))
  }, [id, navigate])

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await orderApi.cancelOrder(order.id)
      toast.success('Order cancelled')
      const { data } = await orderApi.getOrder(id)
      setOrder(data.data || data)
    } catch {
      toast.error('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this cancelled order?')) return
    setDeleting(true)
    try {
      await orderApi.deleteOrder(order.id)
      toast.success('Order deleted')
      navigate('/orders')
    } catch {
      toast.error('Failed to delete order')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Loader />
  if (!order) return null

  const canCancel = ['pending', 'confirmed'].includes(order.status)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-4 md:mb-6 text-xs md:text-sm">
        <FiArrowLeft size={14} /> Back to Orders
      </button>

      {/* Header */}
      <div className="card mb-4 md:mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-base md:text-xl font-bold text-gray-900">Order #{order.order_number || order.id}</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Placed on {formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className={`badge text-[10px] md:text-sm !px-2 md:!px-3 !py-0.5 md:!py-1 ${getStatusColor(order.status)}`}>{order.status}</span>
            {order.payment_status && (
              <span className={`badge text-[10px] md:text-sm !px-2 md:!px-3 !py-0.5 md:!py-1 ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span>
            )}
          </div>
        </div>
      </div>

      {/* Order Status Timeline */}
      <div className="card mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="font-semibold text-gray-900 text-sm md:text-base">Order Status</h2>
          <span className={`badge text-[10px] md:text-sm !px-2 md:!px-3 !py-0.5 md:!py-1 ${getStatusColor(order.status)}`}>{order.status}</span>
        </div>
        <OrderStatusTracker status={order.status} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Shipping Address */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base"><FiMapPin className="text-primary-600" size={16} /> Shipping Address</h2>
          {order.address ? (
            <div className="text-xs md:text-sm text-gray-600 space-y-0.5 md:space-y-1">
              <p className="font-medium text-gray-900">{order.address.address_line1}</p>
              {order.address.address_line2 && <p>{order.address.address_line2}</p>}
              <p>{order.address.city}, {order.address.state} - {order.address.postal_code}</p>
              <p>{order.address.country}</p>
            </div>
          ) : (
            <p className="text-xs md:text-sm text-gray-500">Address details not available</p>
          )}
        </div>

        {/* Payment Info */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base"><FiCreditCard className="text-primary-600" size={16} /> Payment Info</h2>
          <div className="text-xs md:text-sm space-y-1.5 md:space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="text-gray-900 capitalize">{order.payment_method || order.payment?.method || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="text-gray-900">{formatCurrency(order.tax_amount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span>{order.shipping_cost === 0 ? <span className="text-green-600 font-medium">FREE</span> : <span className="text-gray-900">{formatCurrency(order.shipping_cost)}</span>}</div>
            {order.discount_amount > 0 && <div className="flex justify-between"><span className="text-green-600">Discount</span><span className="text-green-600">-{formatCurrency(order.discount_amount)}</span></div>}
            <hr />
            <div className="flex justify-between text-sm md:text-base"><span className="font-semibold text-gray-900">Total</span><span className="font-bold text-base md:text-lg text-gray-900">{formatCurrency(order.grand_total || order.total_amount)}</span></div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card mb-4 md:mb-6">
        <h2 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base"><FiPackage className="text-primary-600" size={16} /> Items ({order.items?.length || 0})</h2>
        <div className="divide-y divide-gray-100">
          {(order.items || []).map(item => (
            <div key={item.id} className="flex items-center gap-3 md:gap-4 py-3 md:py-4 first:pt-0 last:pb-0">
              <Link to={`/shop/${item.product?.slug || item.slug}`} className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={getProductImageUrl(item.product || item)} alt={item.product?.name || item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/shop/${item.product?.slug || item.slug}`} className="text-xs md:text-sm font-medium text-gray-900 hover:text-primary-600 truncate block">{item.product?.name || item.name}</Link>
                <p className="text-[10px] md:text-xs text-gray-500">Qty: {item.quantity} x {formatCurrency(item.price || item.unit_price)}</p>
              </div>
              <p className="text-xs md:text-sm font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(item.total || item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {canCancel && (
        <div className="flex justify-end">
          <button onClick={handleCancel} disabled={cancelling}
            className="btn-danger flex items-center gap-2 text-sm md:text-base">
            <FiXCircle size={16} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}
      {order.status === 'cancelled' && (
        <div className="flex justify-end">
          <button onClick={handleDelete} disabled={deleting}
            className="btn-danger flex items-center gap-2 text-sm md:text-base">
            <FiTrash2 size={16} /> {deleting ? 'Deleting...' : 'Delete Order'}
          </button>
        </div>
      )}
    </div>
  )
}

export default OrderDetails
