import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FiMapPin, FiCreditCard, FiCheck, FiArrowLeft, FiTruck, FiAlertCircle } from 'react-icons/fi'
import { fetchCart, clearCartState } from '../../redux/slices/cartSlice'
import { authApi } from '../../api/authApi'
import { orderApi } from '../../api/orderApi'
import { paymentApi } from '../../api/paymentApi'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, subtotal, taxAmount, shippingCost, discountAmount, grandTotal, loading: cartLoading } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [placing, setPlacing] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    dispatch(fetchCart())
    authApi.getAddresses().then(({ data }) => {
      const addrs = data.results || data || []
      setAddresses(addrs)
      const defaultAddr = addrs.find(a => a.is_default) || addrs[0]
      if (defaultAddr) setSelectedAddress(defaultAddr.id)
    }).catch(() => {})
  }, [dispatch])

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return toast.error('Please select a shipping address')
    setPlacing(true)
    try {
      const { data } = await orderApi.createOrder({
        shipping_address_id: selectedAddress,
        payment_method: paymentMethod,
        notes: '',
      })
      const order = data.data || data

      if (paymentMethod === 'razorpay') {
        const rzp = await paymentApi.createRazorpayOrder(order.id)
        const rzpData = rzp.data.data || rzp.data
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'ShopHub',
          order_id: rzpData.razorpay_order_id,
          prefill: { name: user?.first_name || '', email: user?.email, contact: user?.phone_number || '' },
          handler: async (response) => {
            await paymentApi.verifyRazorpay(response)
            toast.success('Payment successful!')
            dispatch(clearCartState())
            navigate(`/orders/${order.id}`)
          },
          modal: { ondismiss: () => { setPlacing(false); toast.error('Payment cancelled') } },
        }
        const rzpWindow = new window.Razorpay(options)
        rzpWindow.open()
      } else if (paymentMethod === 'stripe') {
        const { data: intentData } = await paymentApi.createStripeIntent(order.id)
        window.location.href = intentData.url
      } else {
        toast.success('Order placed successfully!')
        dispatch(clearCartState())
        navigate(`/orders/${order.id}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  if (cartLoading) return <Loader />
  if (!items?.length) return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-center">
      <FiAlertCircle size={40} className="mx-auto text-gray-300 mb-3 md:mb-4" />
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Your cart is empty</h2>
      <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-6">Add some items before checking out.</p>
      <button onClick={() => navigate('/shop')} className="btn-primary inline-flex text-sm md:text-base">Continue Shopping</button>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-4 md:mb-6 text-xs md:text-sm">
        <FiArrowLeft size={14} /> Back to Cart
      </button>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">Checkout</h1>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">Shipping Address</h2>
            </div>
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-xs md:text-sm">No addresses saved. <button onClick={() => navigate('/profile')} className="text-primary-600 hover:underline">Add one in your profile</button></p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-primary-600" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-gray-900">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                      <p className="text-[10px] md:text-xs text-gray-500">{addr.city}, {addr.state} - {addr.postal_code}</p>
                      <p className="text-[10px] md:text-xs text-gray-500">{addr.country}</p>
                      {addr.is_default && <span className="badge bg-primary-100 text-primary-700 text-[10px] md:text-xs mt-1">Default</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">Payment Method</h2>
            </div>
            <div className="space-y-2 md:space-y-3">
              {[
                { id: 'cod', label: 'Cash on Delivery', icon: FiTruck, desc: 'Pay when you receive' },
                { id: 'razorpay', label: 'Razorpay', icon: FiCreditCard, desc: 'Pay via UPI, cards, net banking' },
                { id: 'stripe', label: 'Stripe', icon: FiCreditCard, desc: 'Pay via credit/debit card' },
              ].map(method => (
                <label key={method.id} className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-primary-600" />
                  <method.icon size={18} className="text-gray-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-900">{method.label}</p>
                    <p className="text-[10px] md:text-xs text-gray-500">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card lg:sticky lg:top-24 h-fit order-first lg:order-last">
          <h2 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base"><FiCheck size={16} className="text-primary-600" /> Order Summary</h2>
          <div className="space-y-2 md:space-y-3 max-h-40 md:max-h-60 overflow-y-auto mb-3 md:mb-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.product?.primary_image ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${item.product.primary_image}` : ''} alt={item.product?.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] md:text-xs text-gray-900 truncate">{item.product?.name}</p>
                  <p className="text-[10px] md:text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-900 whitespace-nowrap">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
          <hr className="mb-3 md:mb-4" />
          <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="text-gray-900">{formatCurrency(taxAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span>{shippingCost === 0 ? <span className="text-green-600 font-medium">FREE</span> : <span className="text-gray-900">{formatCurrency(shippingCost)}</span>}</div>
            {discountAmount > 0 && <div className="flex justify-between"><span className="text-green-600">Discount</span><span className="text-green-600">-{formatCurrency(discountAmount)}</span></div>}
            <hr />
            <div className="flex justify-between text-sm md:text-base"><span className="font-semibold text-gray-900">Total</span><span className="font-bold text-lg md:text-xl text-gray-900">{formatCurrency(grandTotal)}</span></div>
          </div>
          <button onClick={handlePlaceOrder} disabled={placing || !selectedAddress}
            className="btn-primary w-full mt-4 md:mt-6 flex items-center justify-center gap-2 text-sm md:text-base">
            {placing ? 'Processing...' : `Place Order ${formatCurrency(grandTotal)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Checkout
