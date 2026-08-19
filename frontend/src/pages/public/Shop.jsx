import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiX, FiSliders } from 'react-icons/fi'
import { fetchProducts } from '../../redux/slices/productSlice'
import { productApi } from '../../api/productApi'
import ProductGrid from '../../components/common/ProductGrid'
import Pagination from '../../components/common/Pagination'
import Dropdown from '../../components/common/Dropdown'

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useDispatch()
  const { products, total, loading } = useSelector((state) => state.products)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    rating: searchParams.get('rating') || '',
    ordering: searchParams.get('ordering') || '-created_at',
    is_featured: searchParams.get('is_featured') || '',
    is_new_arrival: searchParams.get('is_new_arrival') || '',
    page: parseInt(searchParams.get('page')) || 1,
  })
  const [page, setPage] = useState(filters.page)

  useEffect(() => {
    productApi.getCategories().then(({ data }) => setCategories(data.results || data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    const category = filters.category
    const params = category ? { category } : {}
    productApi.getBrands(params).then(({ data }) => {
      const list = data.results || data.data || data || []
      if (!active) return
      const brandList = Array.isArray(list) ? list : []
      setBrands(brandList)
      if (filters.brand && !brandList.some(b => b.name === filters.brand)) {
        setFilters(prev => ({ ...prev, brand: '', page: 1 }))
        setPage(1)
      }
    }).catch(() => {})
    return () => { active = false }
  }, [filters.category])

  useEffect(() => {
    const params = {}
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params[key] = val
      else if (params[key]) delete params[key]
    })
    setSearchParams(params)
    dispatch(fetchProducts(params))
  }, [filters, dispatch, setSearchParams])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }))
    setPage(key === 'page' ? value : 1)
  }

  const clearFilters = () => {
    setFilters({
      search: '', category: '', brand: '', min_price: '', max_price: '',
      rating: '', ordering: '-created_at', is_featured: '', is_new_arrival: '', page: 1
    })
    setPage(1)
  }

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4 lg:hidden">
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
          <FiSliders size={18} /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`fixed inset-0 z-30 lg:sticky lg:top-8 lg:z-auto lg:w-64 lg:self-start lg:h-fit flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="absolute inset-0 bg-black/40 lg:hidden" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white overflow-y-auto lg:relative lg:h-fit lg:overflow-visible lg:w-full p-6 lg:p-4 lg:bg-gray-50 lg:rounded-xl shadow-lg lg:shadow-none">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button onClick={() => setShowFilters(false)}><FiX size={22} /></button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <h3 className="font-medium text-sm text-gray-900 mb-1.5">Search</h3>
              <input type="text" value={filters.search} onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search products..." className="input-field text-sm" />
            </div>

            {/* Categories */}
            <div className="mb-4">
              <h3 className="font-medium text-sm text-gray-900 mb-1.5">Category</h3>
              <Dropdown value={filters.category} onChange={(v) => updateFilter('category', v)} columns={5}
                placeholder="All Categories" options={categories.map(cat => ({ value: cat.name, label: `${cat.name} (${cat.product_count})` }))} />
            </div>

            {/* Brands */}
            <div className="mb-4">
              <h3 className="font-medium text-sm text-gray-900 mb-1.5">Brand</h3>
              <Dropdown value={filters.brand} onChange={(v) => updateFilter('brand', v)} columns={5}
                placeholder="All Brands" options={brands.map(b => ({ value: b.name, label: b.name }))} />
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <h3 className="font-medium text-sm text-gray-900 mb-1.5">Price Range</h3>
              <div className="flex gap-2 items-center">
                <input type="number" value={filters.min_price} onChange={(e) => updateFilter('min_price', e.target.value)}
                  placeholder="Min" className="input-field text-sm w-1/2" />
                <span className="text-gray-400">-</span>
                <input type="number" value={filters.max_price} onChange={(e) => updateFilter('max_price', e.target.value)}
                  placeholder="Max" className="input-field text-sm w-1/2" />
              </div>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <h3 className="font-medium text-sm text-gray-900 mb-1.5">Minimum Rating</h3>
              <Dropdown value={filters.rating} onChange={(v) => updateFilter('rating', v)}
                placeholder="Any Rating" options={[4, 3, 2, 1].map(r => ({ value: String(r), label: `${r}★ & Up` }))} />
            </div>

            {/* Sort */}
            <div className="mb-4">
              <h3 className="font-medium text-sm text-gray-900 mb-1.5">Sort By</h3>
              <Dropdown value={filters.ordering} onChange={(v) => updateFilter('ordering', v)}
                options={[
                  { value: '-created_at', label: 'Newest First' },
                  { value: '-sales_count', label: 'Best Selling' },
                  { value: 'price', label: 'Price: Low to High' },
                  { value: '-price', label: 'Price: High to Low' },
                  { value: '-average_rating', label: 'Highest Rated' },
                ]} />
            </div>

            <button onClick={clearFilters} className="btn-secondary w-full text-sm">Clear All Filters</button>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} loading={loading} columns={3} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => updateFilter('page', p)} />
        </div>
      </div>
    </div>
  )
}

export default Shop
