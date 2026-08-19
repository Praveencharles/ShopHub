import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { fetchCart, updateCartItem, removeFromCart } from '../../redux/slices/cartSlice'
import { getProductImageUrl, formatCurrency } from '../../utils/helpers'
import Loader from '../../components/common/Loader'

const Cart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, subtotal, totalItems, taxAmount, shippingCost, discountAmount, grandTotal, loading } = useSelector((state) => state.cart)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const handleQuantity = (itemId, newQty) => {
    if (newQty < 1) { dispatch(removeFromCart(itemId)); return }
    dispatch(updateCartItem({ itemId, quantity: newQty }))
  }

  if (loading) return <Loader />
  if (!items?.length) return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 text-center">
      <FiShoppingBag size={40} className="mx-auto text-gray-300 mb-3 md:mb-4" />
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Your cart is empty</h2>
      <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-6">Looks like you haven't added anything yet.</p>
      <Link to="/shop" className="btn-primary inline-flex text-sm md:text-base">Start Shopping</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Shopping Cart ({totalItems} items)</h1>
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex gap-3 md:gap-4 p-3 md:p-4">
              <Link to={`/shop/${item.product?.slug}`} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={getProductImageUrl(item.product)} alt={item.product?.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/shop/${item.product?.slug}`}><h3 className="font-medium text-gray-900 hover:text-primary-600 leading-snug text-sm md:text-base truncate">{item.product?.name}</h3></Link>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">{item.product?.category_name}</p>
                <p className="text-sm md:text-base sm:text-lg font-bold text-gray-900 mt-1">{formatCurrency(item.product?.effective_price || item.product?.price)}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 md:mt-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => handleQuantity(item.id, item.quantity - 1)} className="p-1.5 md:p-2 hover:bg-gray-50"><FiMinus size={12} /></button>
                    <span className="px-2 md:px-3 text-xs md:text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => handleQuantity(item.id, item.quantity + 1)} className="p-1.5 md:p-2 hover:bg-gray-50"><FiPlus size={12} /></button>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 ml-auto">
                    <span className="font-semibold text-gray-900 whitespace-nowrap text-sm md:text-base">{formatCurrency(item.total)}</span>
                    <button onClick={() => dispatch(removeFromCart(item.id))} className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 transition-colors"><FiTrash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card h-fit lg:sticky lg:top-24 order-first lg:order-last">
          <h2 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Order Summary</h2>
          <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax (18% GST)</span><span className="text-gray-900">{formatCurrency(taxAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span>{shippingCost === 0 ? <span className="text-green-600 font-medium">FREE</span> : <span className="text-gray-900">{formatCurrency(shippingCost)}</span>}</div>
            {discountAmount > 0 && <div className="flex justify-between"><span className="text-green-600">Discount</span><span className="text-green-600">-{formatCurrency(discountAmount)}</span></div>}
            <hr />
            <div className="flex justify-between text-sm md:text-base"><span className="font-semibold text-gray-900">Grand Total</span><span className="font-bold text-lg md:text-xl text-gray-900">{formatCurrency(grandTotal)}</span></div>
          </div>
          <button onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}
            className="btn-primary w-full mt-4 md:mt-6 flex items-center justify-center gap-2 text-sm md:text-base">
            Proceed to Checkout <FiArrowRight />
          </button>
          <Link to="/shop" className="block text-center text-xs md:text-sm text-primary-600 mt-2 md:mt-3 hover:underline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}

export default Cart
