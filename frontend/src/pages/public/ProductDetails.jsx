import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'
import { fetchProduct, clearCurrentProduct } from '../../redux/slices/productSlice'
import { addToCart } from '../../redux/slices/cartSlice'
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice'
import { productApi } from '../../api/productApi'
import { reviewApi } from '../../api/reviewApi'
import ProductGrid from '../../components/common/ProductGrid'
import StarRating from '../../components/common/StarRating'
import Loader from '../../components/common/Loader'
import { formatCurrency, getImageUrl, getProductImageUrl, formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const normalizeReviews = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const ProductDetails = () => {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { currentProduct, loading } = useSelector((state) => state.products)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [activeTab, setActiveTab] = useState('description')

  const product = currentProduct?.data || currentProduct
  const isInWishlist = wishlistItems.some(item => item.product?.id === product?.id || item.product_id === product?.id)

  useEffect(() => {
    dispatch(fetchProduct(slug))
    window.scrollTo(0, 0)
    return () => dispatch(clearCurrentProduct())
  }, [slug, dispatch])

  useEffect(() => {
    if (product?.id) {
      productApi.getRelated(slug).then(({ data }) => setRelated(data.data || [])).catch(() => {})
      reviewApi.getProductReviews(product.id).then(({ data }) => setReviews(normalizeReviews(data))).catch(() => {})
    }
  }, [product?.id, slug])

  const handleAddToCart = () => {
    if (!product?.id) return
    dispatch(addToCart({ product_id: product.id, quantity }))
  }

  const handleWishlistToggle = () => {
    if (!product?.id) return
    if (isInWishlist) dispatch(removeFromWishlist(product.id))
    else dispatch(addToWishlist(product.id))
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return toast.error('Please login to review')
    try {
      await reviewApi.createReview({ product: product.id, ...reviewForm })
      toast.success('Review submitted!')
      setReviewForm({ rating: 5, title: '', comment: '' })
      const { data } = await reviewApi.getProductReviews(product.id)
      setReviews(normalizeReviews(data))
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0]?.message || 'Failed to submit review')
    }
  }

  if (loading) return <Loader fullScreen />
  if (!product) return <div className="text-center py-20"><p className="text-gray-500">Product not found</p></div>

  const images = product.images || []
  const mainImageSrc = images.length > 0
    ? getImageUrl(images[selectedImage]?.image)
    : getProductImageUrl(product)
  const features = [
    { icon: FiTruck, text: 'Free shipping on orders above ₹500' },
    { icon: FiShield, text: 'Secure checkout with SSL encryption' },
    { icon: FiRefreshCw, text: '30-day hassle-free returns' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-primary-600">Shop</Link>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <Link to={`/shop?category=${product.category.name}`} className="hover:text-primary-600">{product.category.name}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Product Main */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
            <img src={mainImageSrc} alt={product.name}
              className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-primary-500' : 'border-gray-200'
                  }`}>
                  <img src={getImageUrl(img.image)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <Link to={`/shop?category=${product.category.name}`}
              className="text-xs text-primary-600 font-semibold uppercase tracking-wider hover:underline">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={parseFloat(product.average_rating)} readonly />
            <span className="text-sm text-gray-500">({product.review_count} reviews)</span>
            {product.sales_count > 0 && (
              <span className="text-sm text-gray-500">| {product.sales_count} sold</span>
            )}
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.effective_price)}</span>
            {product.discount_price && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <span className="badge bg-red-100 text-red-700 text-sm">-{product.discount_percentage}% OFF</span>
              </>
            )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-gray-600 mb-6 leading-relaxed">{product.short_description}</p>
          )}

          {/* Availability */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6">
            {product.in_stock ? (
              <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full" /> In Stock ({product.stock_quantity} available)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full" /> Out of Stock
              </span>
            )}
            {product.sku && <span className="text-sm text-gray-400 break-all">SKU: {product.sku}</span>}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 transition-colors">
                <FiMinus size={16} />
              </button>
              <span className="px-4 font-medium min-w-[40px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="p-3 hover:bg-gray-50 transition-colors" disabled={quantity >= product.stock_quantity}>
                <FiPlus size={16} />
              </button>
            </div>
            <button onClick={handleAddToCart} disabled={!product.in_stock}
              className="btn-primary flex-1 min-w-[150px] flex items-center justify-center gap-2 !py-3">
              <FiShoppingCart size={20} /> Add to Cart
            </button>
            <button onClick={handleWishlistToggle}
              className={`p-3.5 rounded-lg border-2 transition-colors ${
                isInWishlist ? 'border-red-300 text-red-500 bg-red-50' : 'border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500'
              }`}>
              <FiHeart size={20} className={isInWishlist ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Features */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <f.icon size={18} className="text-primary-600 flex-shrink-0" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-12">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            {['description', 'reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                  activeTab === tab ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}>
                {tab === 'reviews' ? `Reviews (${product.review_count})` : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">{product.description || 'No description available.'}</p>
            {product.tags && (
              <div className="flex gap-2 mt-4">
                {product.tags.split(',').map((tag, i) => (
                  <span key={i} className="badge bg-gray-100 text-gray-600">#{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 font-semibold text-sm">{review.user_name?.[0] || review.user_email?.[0] || 'U'}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{review.user_name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                          </div>
                        </div>
                        {review.is_verified_purchase && (
                          <span className="badge bg-green-100 text-green-700 text-xs flex-shrink-0">Verified Purchase</span>
                        )}
                      </div>
                      <StarRating rating={review.rating} readonly size="sm" />
                      {review.title && <h4 className="font-medium text-sm mt-2">{review.title}</h4>}
                      <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write Review */}
            {isAuthenticated && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Your Rating</label>
                    <StarRating rating={reviewForm.rating} onRate={(r) => setReviewForm(prev => ({ ...prev, rating: r }))} size="lg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Title (optional)</label>
                    <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field text-sm" placeholder="Great product!" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Review</label>
                    <textarea value={reviewForm.comment} onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      className="input-field text-sm" rows={3} placeholder="Share your experience..." required />
                  </div>
                  <button type="submit" className="btn-primary w-full">Submit Review</button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="section-title">Related Products</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}

export default ProductDetails
