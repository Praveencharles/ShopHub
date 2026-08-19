import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../../api/authApi'
import toast from 'react-hot-toast'

const user = JSON.parse(localStorage.getItem('user') || 'null')
const accessToken = localStorage.getItem('accessToken')
const refreshToken = localStorage.getItem('refreshToken')

const initialState = {
  user,
  accessToken,
  refreshToken,
  isAuthenticated: !!user,
  loading: false,
  error: null,
}

const extractErrorMessage = (error, fallback) => {
  const data = error.response?.data
  if (data) {
    if (typeof data.message === 'string' && data.message) return data.message
    if (typeof data.detail === 'string' && data.detail) return data.detail
    const errors = data.errors
    if (errors) {
      if (Array.isArray(errors)) {
        const msg = errors.map((e) => e?.message).find(Boolean)
        if (msg) return msg
      } else if (typeof errors === 'object') {
        const msgs = Object.values(errors)
          .flat()
          .map((m) => (typeof m === 'string' ? m : m?.message))
          .filter(Boolean)
        if (msgs.length) return msgs[0]
      }
    }
  }
  return fallback
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(credentials)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      localStorage.setItem('accessToken', data.data.tokens.access)
      localStorage.setItem('refreshToken', data.data.tokens.refresh)
      toast.success('Login successful!')
      return data.data
    } catch (error) {
      const msg = extractErrorMessage(error, 'Login failed')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(userData)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      localStorage.setItem('accessToken', data.data.tokens.access)
      localStorage.setItem('refreshToken', data.data.tokens.refresh)
      toast.success('Registration successful!')
      return data.data
    } catch (error) {
      const msg = extractErrorMessage(error, 'Registration failed')
      toast.error(msg)
      return rejectWithValue(msg)
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await authApi.updateProfile(profileData)
      localStorage.setItem('user', JSON.stringify(data))
      toast.success('Profile updated!')
      return data
    } catch (error) {
      toast.error('Failed to update profile')
      return rejectWithValue(error.response?.data)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      toast.success('Logged out')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.tokens.access
        state.refreshToken = action.payload.tokens.refresh
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.tokens.access
        state.refreshToken = action.payload.tokens.refresh
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, setCredentials, clearError } = authSlice.actions
export default authSlice.reducer
