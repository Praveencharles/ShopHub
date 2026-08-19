import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartApi } from '../../api/cartApi'
import toast from 'react-hot-toast'

const initialState = {
  items: [],
  subtotal: 0,
  totalItems: 0,
  taxAmount: 0,
  shippingCost: 0,
  discountAmount: 0,
  grandTotal: 0,
  loading: false,
  error: null,
}

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await cartApi.getCart()
    return data.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const addToCart = createAsyncThunk('cart/addToCart', async ({ product_id, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await cartApi.addToCart({ product_id, quantity })
    toast.success('Added to cart')
    return data.data
  } catch (error) {
    const msg = error.response?.data?.message || 'Failed to add to cart'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await cartApi.updateCartItem(itemId, { quantity })
    return data.data
  } catch (error) {
    toast.error('Failed to update')
    return rejectWithValue(error.response?.data)
  }
})

export const removeFromCart = createAsyncThunk('cart/removeItem', async (itemId, { rejectWithValue }) => {
  try {
    const { data } = await cartApi.removeCartItem(itemId)
    toast.success('Removed from cart')
    return data.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = []
      state.subtotal = 0
      state.totalItems = 0
      state.grandTotal = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.subtotal = parseFloat(action.payload.subtotal)
        state.totalItems = action.payload.total_items
        state.taxAmount = parseFloat(action.payload.tax_amount)
        state.shippingCost = parseFloat(action.payload.shipping_cost)
        state.discountAmount = parseFloat(action.payload.discount_amount)
        state.grandTotal = parseFloat(action.payload.grand_total)
      })
      .addCase(fetchCart.rejected, (state) => { state.loading = false })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.subtotal = parseFloat(action.payload.subtotal)
        state.totalItems = action.payload.total_items
        state.taxAmount = parseFloat(action.payload.tax_amount)
        state.shippingCost = parseFloat(action.payload.shipping_cost)
        state.discountAmount = parseFloat(action.payload.discount_amount)
        state.grandTotal = parseFloat(action.payload.grand_total)
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.subtotal = parseFloat(action.payload.subtotal)
        state.totalItems = action.payload.total_items
        state.taxAmount = parseFloat(action.payload.tax_amount)
        state.shippingCost = parseFloat(action.payload.shipping_cost)
        state.discountAmount = parseFloat(action.payload.discount_amount)
        state.grandTotal = parseFloat(action.payload.grand_total)
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.subtotal = parseFloat(action.payload.subtotal)
        state.totalItems = action.payload.total_items
        state.taxAmount = parseFloat(action.payload.tax_amount)
        state.shippingCost = parseFloat(action.payload.shipping_cost)
        state.discountAmount = parseFloat(action.payload.discount_amount)
        state.grandTotal = parseFloat(action.payload.grand_total)
      })
  },
})

export const { clearCart: clearCartState } = cartSlice.actions
export default cartSlice.reducer
