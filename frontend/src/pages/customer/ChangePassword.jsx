import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'
import { authApi } from '../../api/authApi'
import toast from 'react-hot-toast'

const ChangePassword = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ old_password: '', new_password: '', new_password2: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [changing, setChanging] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.new_password2) {
      return toast.error('New passwords do not match')
    }
    setChanging(true)
    try {
      await authApi.changePassword({
        old_password: form.old_password,
        new_password: form.new_password,
        new_password2: form.new_password2,
      })
      toast.success('Password changed successfully')
      navigate('/profile')
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.detail || 'Failed to change password')
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm">
        <FiArrowLeft size={16} /> Back to Profile
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type={showPassword ? 'text' : 'password'} value={form.old_password}
              onChange={(e) => setForm({ ...form, old_password: e.target.value })}
              className="input-field pl-10 pr-10" placeholder="Enter current password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type={showPassword ? 'text' : 'password'} value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              className="input-field pl-10" placeholder="Enter new password" required minLength={8} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type={showPassword ? 'text' : 'password'} value={form.new_password2}
              onChange={(e) => setForm({ ...form, new_password2: e.target.value })}
              className="input-field pl-10" placeholder="Confirm new password" required minLength={8} />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={changing}>
          {changing ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}

export default ChangePassword
