import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { productApi } from '../../api/productApi'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const AdminBrands = () => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchBrands = () => {
    setLoading(true)
    productApi.getBrands({ page_size: 100 }).then(({ data }) => {
      setBrands(data.results || data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchBrands() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setShowForm(true) }
  const openEdit = (brand) => { setEditing(brand); setForm({ name: brand.name, description: brand.description || '' }); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) {
        await productApi.updateBrand(editing.id || editing.slug, form)
        toast.success('Brand updated')
      } else {
        await productApi.createBrand(form)
        toast.success('Brand created')
      }
      setShowForm(false)
      fetchBrands()
    } catch { toast.error('Failed to save') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand?')) return
    try { await productApi.deleteBrand(id); toast.success('Deleted'); fetchBrands() }
    catch { toast.error('Failed to delete') }
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus size={18} /> Add Brand</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Edit Brand' : 'Add Brand'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input-field" rows={3} /></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map(brand => (
          <div key={brand.id} className="card flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900">{brand.name}</h3>
              {brand.description && <p className="text-xs text-gray-500 mt-1 break-words">{brand.description}</p>}
              <span className="text-xs text-gray-400">{brand.product_count || 0} products</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => openEdit(brand)} className="p-1.5 text-gray-400 hover:text-primary-600"><FiEdit2 size={16} /></button>
              <button onClick={() => handleDelete(brand.id || brand.slug)} className="p-1.5 text-gray-400 hover:text-red-600"><FiTrash2 size={16} /></button>
            </div>
          </div>
        ))}
        {!brands.length && <p className="text-gray-500 col-span-full text-center py-8">No brands yet</p>}
      </div>
    </div>
  )
}

export default AdminBrands
