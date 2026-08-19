import { useSelector, useDispatch } from 'react-redux'
import { logout as logoutAction } from '../redux/slices/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)

  const logout = () => dispatch(logoutAction())

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin: user?.role === 'admin',
    logout,
  }
}
