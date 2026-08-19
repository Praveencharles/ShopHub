import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiGrid, FiPackage, FiFolder, FiTag, FiShoppingBag, FiUsers, FiBox, FiMenu, FiX, FiHome } from 'react-icons/fi'

const sidebarItems = [
  { icon: FiGrid, label: 'Dashboard', path: '/admin' },
  { icon: FiPackage, label: 'Products', path: '/admin/products' },
  { icon: FiFolder, label: 'Categories', path: '/admin/categories' },
  { icon: FiTag, label: 'Brands', path: '/admin/brands' },
  { icon: FiShoppingBag, label: 'Orders', path: '/admin/orders' },
  { icon: FiUsers, label: 'Users', path: '/admin/users' },
  { icon: FiBox, label: 'Inventory', path: '/admin/inventory' },
]

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen lg:h-dvh bg-white border-r border-gray-200 transform transition-transform duration-200 overflow-y-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-gray-900">Admin Panel</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path)
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <item.icon size={20} />
                {item.label}
              </Link>
            )
          })}
          <hr className="my-2" />
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
            <FiHome size={20} /> Back to Store
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 h-16 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <FiMenu size={22} />
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">View Store</Link>
        </header>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
