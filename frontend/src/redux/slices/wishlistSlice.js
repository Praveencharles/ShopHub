import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { wishlistApi } from '../../api/wishlistApi'
import toast from 'react-hot-toast'

const initialState = {
  items: [],
  loading: false,
}

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await wishlistApi.getWishlist()
    return data.results || data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await wishlistApi.addToWishlist(productId)
    toast.success('Added to wishlist')
    return data
  } catch (error) {
    const msg = error.response?.data?.message || 'Already in wishlist'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try {
    await wishlistApi.removeFromWishlist(productId)
    toast.success('Removed from wishlist')
    return productId
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchWishlist.rejected, (state) => { state.loading = false })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (!state.items.some(item => item.product?.id === action.payload.product?.id)) {
          state.items.push(action.payload)
        }
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.product?.id !== action.payload && item.product_id !== action.payload)
      })
  },
})

export default wishlistSlice.reducer
