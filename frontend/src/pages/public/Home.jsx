import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi'
import { fetchFeatured, fetchNewArrivals, fetchBestSelling } from '../../redux/slices/productSlice'
import ProductGrid from '../../components/common/ProductGrid'
import Loader from '../../components/common/Loader'
const Home = () => {
  const dispatch = useDispatch()
  const { featured, newArrivals, bestSelling, loading } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchFeatured())
    dispatch(fetchNewArrivals())
    dispatch(fetchBestSelling())
  }, [dispatch])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-24">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div>
              <p className="text-primary-200 font-semibold tracking-wide uppercase text-xs md:text-sm mb-2 md:mb-3">Summer Collection 2026</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 md:mb-6">
                Discover Premium <span className="text-primary-300">Shopping</span> Experience
              </h1>
              <p className="text-primary-100 text-sm md:text-lg mb-5 md:mb-8 leading-relaxed">
                Shop the latest trends with unbeatable prices. Free shipping on orders over ₹500.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <Link to="/shop" className="bg-white text-primary-700 px-5 py-2.5 md:px-8 md:py-3.5 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center gap-2 text-sm md:text-base">
                  Shop Now <FiArrowRight />
                </Link>
                <Link to="/shop?ordering=-sales_count" className="border-2 border-white/40 text-white px-5 py-2.5 md:px-8 md:py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm md:text-base">
                  Best Sellers
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-primary-600 rounded-full opacity-30 absolute -top-10 -right-10" />
                <div className="w-72 h-72 bg-primary-500 rounded-full opacity-20 absolute -bottom-10 -left-10" />
                <img src="/homepage.jpg" alt="Shopping" className="relative z-10 rounded-2xl shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over ₹500' },
            { icon: FiShield, title: 'Secure Payment', desc: '100% secure checkout' },
            { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
            { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer service' },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-3 md:p-4 lg:p-6 text-center hover:-translate-y-1 transition-transform">
              <div className="w-9 h-9 md:w-12 md:h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                <feature.icon size={18} className="md:hidden" />
                <feature.icon size={24} className="hidden md:block" />
              </div>
              <h3 className="font-semibold text-gray-900 text-xs md:text-sm lg:text-base">{feature.title}</h3>
              <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 mt-0.5 md:mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="flex items-center justify-between mb-5 md:mb-8">
          <div>
            <h2 className="section-title mb-0.5 md:mb-1 !mb-0">Featured Products</h2>
            <p className="text-gray-500 text-xs md:text-base">Handpicked favorites just for you</p>
          </div>
          <Link to="/shop?is_featured=true" className="btn-outline text-xs md:text-sm flex">View All</Link>
        </div>
        {loading ? <Loader /> : <ProductGrid products={featured} />}
      </section>

      {/* Banner */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Summer Sale — Up to 50% Off</h2>
          <p className="text-purple-100 text-sm md:text-lg mb-5 md:mb-8">Limited time offer on selected items. Don't miss out!</p>
          <Link to="/shop" className="bg-white text-purple-700 px-5 py-2.5 md:px-8 md:py-3.5 rounded-lg font-semibold hover:bg-purple-50 transition-colors inline-flex items-center gap-2 text-sm md:text-base">
            Shop the Sale <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="flex items-center justify-between mb-5 md:mb-8">
          <div>
            <h2 className="section-title mb-0.5 md:mb-1 !mb-0">New Arrivals</h2>
            <p className="text-gray-500 text-xs md:text-base">Fresh products added this week</p>
          </div>
          <Link to="/shop?is_new_arrival=true" className="btn-outline text-xs md:text-sm flex">View All</Link>
        </div>
        {loading ? <Loader /> : <ProductGrid products={newArrivals} />}
      </section>

      {/* Best Selling */}
      <section className="bg-gray-100 py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5 md:mb-8">
            <div>
              <h2 className="section-title mb-0.5 md:mb-1 !mb-0">Best Selling</h2>
              <p className="text-gray-500 text-xs md:text-base">Most popular products by sales</p>
            </div>
            <Link to="/shop?ordering=-sales_count" className="btn-outline text-xs md:text-sm flex">View All</Link>
          </div>
          {loading ? <Loader /> : <ProductGrid products={bestSelling} />}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="bg-primary-50 rounded-2xl p-6 md:p-8 lg:p-12 text-center">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Stay in the Loop</h2>
          <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6 max-w-md mx-auto">Subscribe to get special offers, free giveaways, and exclusive deals.</p>
          <form className="flex flex-col sm:flex-row gap-2 md:gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="input-field flex-1 text-sm" required />
            <button type="submit" className="btn-primary whitespace-nowrap text-sm">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Home
