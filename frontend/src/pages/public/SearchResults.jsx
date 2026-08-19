import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../../redux/slices/productSlice'
import ProductGrid from '../../components/common/ProductGrid'

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const { products, total, loading } = useSelector((state) => state.products)
  const query = searchParams.get('q') || ''

  useEffect(() => {
    if (query) dispatch(fetchProducts({ search: query }))
  }, [query, dispatch])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-500 mt-1">{total} results for "{query}"</p>
      </div>
      <ProductGrid products={products} loading={loading} />
    </div>
  )
}

export default SearchResults
