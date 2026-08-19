import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { productApi } from '../../api/productApi'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = () => {
    setLoading(true)
    productApi.getCategories({ page_size: 100 }).then(({ data }) => {
      setCategories(data.results || data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setShowForm(true) }
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '' }); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) {
        await productApi.updateCategory(editing.id, form)
        toast.success('Category updated')
      } else {
        await productApi.createCategory(form)
        toast.success('Category created')
      }
      setShowForm(false)
      fetchCategories()
    } catch { toast.error('Failed to save') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try { await productApi.deleteCategory(id); toast.success('Deleted'); fetchCategories() }
    catch { toast.error('Failed to delete') }
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus size={18} /> Add Category</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
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
        {categories.map(cat => (
          <div key={cat.id} className="card flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900">{cat.name}</h3>
              {cat.description && <p className="text-xs text-gray-500 mt-1 break-words">{cat.description}</p>}
              <span className="text-xs text-gray-400">{cat.product_count || 0} products</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-primary-600"><FiEdit2 size={16} /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600"><FiTrash2 size={16} /></button>
            </div>
          </div>
        ))}
        {!categories.length && <p className="text-gray-500 col-span-full text-center py-8">No categories yet</p>}
      </div>
    </div>
  )
}

export default AdminCategories
