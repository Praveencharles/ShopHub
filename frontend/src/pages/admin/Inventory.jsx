import { useState, useEffect } from 'react'
import { FiPackage, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { productApi } from '../../api/productApi'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import Pagination from '../../components/common/Pagination'

const AdminInventory = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState('all')
  const [editStock, setEditStock] = useState(null)
  const [stockValue, setStockValue] = useState(0)
  const [saving, setSaving] = useState(false)

  const fetchProducts = () => {
    setLoading(true)
    const params = { page, page_size: 20, ordering: 'stock_quantity' }
    if (filter === 'low') params.stock_quantity__lte = 10
    if (filter === 'out') params.in_stock = false
    productApi.getProducts(params).then(({ data }) => {
      setProducts(data.results || data.data || [])
      setTotalPages(Math.ceil((data.count || 0) / 20))
    }).catch(() => toast.error('Failed to load inventory')).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [page, filter])

  const handleUpdateStock = async (id) => {
    setSaving(true)
    try {
      await productApi.updateProduct(id, { stock_quantity: stockValue })
      toast.success('Stock updated')
      setEditStock(null)
      fetchProducts()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex gap-2">
          {['all', 'low', 'out'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Current Stock</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className={`hover:bg-gray-50 ${product.stock_quantity <= 5 ? 'bg-red-50/50' : product.stock_quantity <= 10 ? 'bg-yellow-50/50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${product.stock_quantity <= 5 ? 'bg-red-100 text-red-600' : product.stock_quantity <= 10 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                      {product.stock_quantity <= 5 ? <FiAlertTriangle size={16} /> : <FiCheckCircle size={16} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category_name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{product.sku || '-'}</td>
                <td className="px-4 py-3">
                  {editStock === product.id ? (
                    <div className="flex items-center gap-2">
                      <input type="number" value={stockValue} onChange={(e) => setStockValue(parseInt(e.target.value) || 0)} className="input-field w-20 text-sm" min="0" />
                      <button onClick={() => handleUpdateStock(product.id)} disabled={saving} className="btn-primary text-xs !px-3 !py-1.5">{saving ? '...' : 'Save'}</button>
                      <button onClick={() => setEditStock(null)} className="btn-secondary text-xs !px-3 !py-1.5">Cancel</button>
                    </div>
                  ) : (
                    <span className={`font-bold ${product.stock_quantity <= 5 ? 'text-red-600' : product.stock_quantity <= 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                      {product.stock_quantity}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditStock(product.id); setStockValue(product.stock_quantity) }}
                    className="btn-primary text-xs !px-3 !py-1.5">
                    Update Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

export default AdminInventory
