import ProductCard from './ProductCard'

const ProductGrid = ({ products, loading, columns = 4 }) => {
  if (loading) {
    return (
      <>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-3 lg:grid-cols-4 md:snap-none product-scroll-hide pb-2 md:pb-0">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="min-w-[160px] max-w-[200px] snap-start flex-shrink-0 bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse md:min-w-0 md:max-w-none md:flex-none">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  if (!products?.length) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm md:text-lg">No products found</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth md:hidden product-scroll-hide pb-2">
        {products.map((product) => (
          <div key={product.id} className="min-w-[160px] max-w-[200px] snap-start flex-shrink-0">
            <ProductCard product={product} mobileCompact />
          </div>
        ))}
      </div>
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  )
}

export default ProductGrid
