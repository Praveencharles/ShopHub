import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import { productApi } from '../../api/productApi'
import { getProductImageUrl, formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import Pagination from '../../components/common/Pagination'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', brand: '', stock_quantity: '', sku: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchProducts = () => {
    setLoading(true)
    productApi.getProducts({ page, search, page_size: 10 }).then(({ data }) => {
      setProducts(data.results || data.data || [])
      setTotalPages(Math.ceil((data.count || 0) / 10))
    }).catch(() => toast.error('Failed to load products')).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [page])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProducts() }

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', price: '', category: '', brand: '', stock_quantity: '', sku: '' }); setShowForm(true) }
  const openEdit = (product) => { setEditing(product); setForm({ name: product.name, description: product.description || '', price: product.price, category: product.category?.id || '', brand: product.brand?.id || '', stock_quantity: product.stock_quantity, sku: product.sku || '' }); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) {
        await productApi.updateProduct(editing.id, form)
        toast.success('Product updated')
      } else {
        await productApi.createProduct(form)
        toast.success('Product created')
      }
      setShowForm(false)
      fetchProducts()
    } catch { toast.error('Failed to save product') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try { await productApi.deleteProduct(id); toast.success('Deleted'); fetchProducts() }
    catch { toast.error('Failed to delete') }
  }

  if (loading && !products.length) return <Loader />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus size={18} /> Add Product</button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-10" />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </form>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Price</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="input-field" required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" value={form.stock_quantity} onChange={(e) => setForm({...form, stock_quantity: e.target.value})} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU</label><input type="text" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} className="input-field" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input-field" rows={3} /></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={getProductImageUrl(product)} alt={product.name} className="w-10 h-10 rounded-lg bg-gray-100 object-cover" />
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category_name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{product.sku || '-'}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(product.effective_price || product.price)}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${product.stock_quantity <= 5 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock_quantity}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.in_stock ? 'Active' : 'Out of Stock'}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(product)} className="p-1.5 text-gray-400 hover:text-primary-600"><FiEdit2 size={16} /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-600"><FiTrash2 size={16} /></button>
                  </div>
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

export default AdminProducts
