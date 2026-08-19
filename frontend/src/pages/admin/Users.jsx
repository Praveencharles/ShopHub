import { useState, useEffect } from 'react'
import { FiMail, FiCalendar, FiShield } from 'react-icons/fi'
import { authApi } from '../../api/authApi'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import Pagination from '../../components/common/Pagination'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    // The backend may not have a users endpoint exposed via the auth API;
    // this uses the same pattern and will gracefully show an empty state if unavailable.
    authApi.getProfile().then(() => {}).catch(() => {})
    // Since there's no dedicated admin users endpoint in the authApi,
    // we'll show a placeholder message. In a real app, add authApi.getUsers().
    setLoading(false)
    setUsers([])
  }, [page])

  if (loading) return <Loader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>
      <div className="card text-center py-12">
        <FiShield size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">User Management</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          The user management API endpoint is not yet available. To manage users, use the Django Admin panel at <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">/admin/</code>.
        </p>
      </div>
    </div>
  )
}

export default AdminUsers
