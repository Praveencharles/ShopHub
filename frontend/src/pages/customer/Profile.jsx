import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiSave, FiMapPin, FiPlus, FiTrash2, FiLock } from 'react-icons/fi'
import { updateProfile } from '../../redux/slices/authSlice'
import { authApi } from '../../api/authApi'
import toast from 'react-hot-toast'

const Profile = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [form, setForm] = useState({
    username: '', first_name: '', last_name: '', phone_number: ''
  })
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India'
  })

  useEffect(() => {
    if (user) setForm({
      username: user.username || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
    })
    authApi.getAddresses().then(({ data }) => setAddresses(data.results || data || [])).catch(() => {})
  }, [user])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(updateProfile(form))
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    try {
      await authApi.createAddress(addressForm)
      toast.success('Address added')
      setShowAddressForm(false)
      setAddressForm({ address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India' })
      const { data } = await authApi.getAddresses()
      setAddresses(data.results || data || [])
    } catch { toast.error('Failed to add address') }
  }

  const handleDeleteAddress = async (id) => {
    try { await authApi.deleteAddress(id); setAddresses(addresses.filter(a => a.id !== id)); toast.success('Address deleted') }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Profile Info */}
          <form onSubmit={handleSubmit} className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-field pl-10" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="email" value={user?.email || ''} className="input-field pl-10 bg-gray-50" disabled /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative"><FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input-field pl-10" /></div>
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2"><FiSave size={18} /> Save Changes</button>
          </form>

          {/* Addresses */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">My Addresses</h2>
              <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-primary text-sm !px-4 !py-2 flex items-center gap-1"><FiPlus size={16} /> Add</button>
            </div>
            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Address Line 1</label><input type="text" value={addressForm.address_line1} onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })} className="input-field text-sm" required /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Address Line 2</label><input type="text" value={addressForm.address_line2} onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })} className="input-field text-sm" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">City</label><input type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="input-field text-sm" required /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">State</label><input type="text" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="input-field text-sm" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Postal Code</label><input type="text" value={addressForm.postal_code} onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })} className="input-field text-sm" required /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Country</label><input type="text" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="input-field text-sm" /></div>
                </div>
                <button type="submit" className="btn-primary text-sm">Save Address</button>
              </form>
            )}
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm">No addresses saved yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div key={addr.id} className="flex items-start justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3 min-w-0">
                      <FiMapPin className="text-primary-600 mt-0.5 flex-shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900 break-words">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                        <p className="text-xs text-gray-500">{addr.city}, {addr.state} - {addr.postal_code}</p>
                        <p className="text-xs text-gray-500">{addr.country}</p>
                        {addr.is_default && <span className="badge bg-primary-100 text-primary-700 text-xs mt-1">Default</span>}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"><FiTrash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="card text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-primary-600">{user?.first_name?.[0] || user?.username?.[0] || 'U'}</span>
          </div>
          <h2 className="font-semibold text-gray-900">{user?.first_name} {user?.last_name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="badge bg-primary-100 text-primary-700 mt-3 capitalize">{user?.role}</span>
          <Link to="/change-password" className="btn-outline w-full mt-4 flex items-center justify-center gap-2 text-sm">
            <FiLock size={14} /> Change Password
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Profile
