import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { authApi } from '../../api/authApi'
import toast from 'react-hot-toast'

const ResetPassword = () => {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', password2: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) {
      return toast.error('Passwords do not match')
    }
    setResetting(true)
    try {
      await authApi.confirmPasswordReset({
        token: `${uid}/${token}`,
        password: form.password,
        password2: form.password2,
      })
      setSuccess(true)
      toast.success('Password reset successful')
    } catch {
      toast.error('Invalid or expired reset link')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-2">Enter your new password</p>
        </div>
        {success ? (
          <div className="card text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheckCircle size={28} className="text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Password Reset Complete</h2>
            <p className="text-sm text-gray-500">Your password has been successfully reset.</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              <FiArrowLeft size={16} /> Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10" placeholder="Enter new password" required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showPassword ? 'text' : 'password'} value={form.password2}
                  onChange={(e) => setForm({ ...form, password2: e.target.value })}
                  className="input-field pl-10" placeholder="Confirm new password" required minLength={8} />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={resetting}>
              {resetting ? 'Resetting...' : 'Reset Password'}
            </button>
            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-primary-600 font-medium hover:underline inline-flex items-center gap-1">
                <FiArrowLeft size={14} /> Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
