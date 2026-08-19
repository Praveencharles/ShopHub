import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FiTrash2, FiShoppingCart, FiHeart } from 'react-icons/fi'
import { fetchWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice'
import { addToCart } from '../../redux/slices/cartSlice'
import { getProductImageUrl, formatCurrency } from '../../utils/helpers'
import Loader from '../../components/common/Loader'

const Wishlist = () => {
  const dispatch = useDispatch()
  const { items, loading } = useSelector((state) => state.wishlist)

  useEffect(() => { dispatch(fetchWishlist()) }, [dispatch])

  const handleRemove = (productId) => dispatch(removeFromWishlist(productId))
  const handleMoveToCart = (product) => {
    dispatch(addToCart({ product_id: product.id, quantity: 1 }))
    dispatch(removeFromWishlist(product.id))
  }

  if (loading) return <Loader />
  if (!items?.length) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <FiHeart size={48} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
      <p className="text-gray-500 mb-6">Save your favorite items here!</p>
      <Link to="/shop" className="btn-primary inline-flex">Browse Products</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((item) => {
          const product = item.product
          if (!product) return null
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
              <Link to={`/shop/${product.slug}`} className="block aspect-square bg-gray-100">
                <img src={getProductImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </Link>
              <div className="p-3">
                <Link to={`/shop/${product.slug}`}><h3 className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-2">{product.name}</h3></Link>
                <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(product.effective_price || product.price)}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleMoveToCart(product)} className="btn-primary text-xs !px-3 !py-1.5 flex-1 flex items-center justify-center gap-1"><FiShoppingCart size={14} /> Move</button>
                  <button onClick={() => handleRemove(product.id)} className="p-1.5 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"><FiTrash2 size={16} /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Wishlist
