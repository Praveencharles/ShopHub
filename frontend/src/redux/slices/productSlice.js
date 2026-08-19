import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { productApi } from '../../api/productApi'

const initialState = {
  products: [],
  featured: [],
  newArrivals: [],
  bestSelling: [],
  currentProduct: null,
  total: 0,
  loading: false,
  error: null,
}

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await productApi.getProducts(params)
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const fetchProduct = createAsyncThunk('products/fetchOne', async (slug, { rejectWithValue }) => {
  try {
    const { data } = await productApi.getProduct(slug)
    return data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const fetchFeatured = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await productApi.getFeatured()
    return data.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const fetchNewArrivals = createAsyncThunk('products/fetchNewArrivals', async (_, { rejectWithValue }) => {
  try {
    const { data } = await productApi.getNewArrivals()
    return data.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const fetchBestSelling = createAsyncThunk('products/fetchBestSelling', async (_, { rejectWithValue }) => {
  try {
    const { data } = await productApi.getBestSelling()
    return data.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => { state.currentProduct = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.results || action.payload.data || action.payload
        state.total = action.payload.count || action.payload.length || 0
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload.data || action.payload
      })
      .addCase(fetchFeatured.fulfilled, (state, action) => { state.featured = action.payload })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => { state.newArrivals = action.payload })
      .addCase(fetchBestSelling.fulfilled, (state, action) => { state.bestSelling = action.payload })
  },
})

export const { clearCurrentProduct } = productSlice.actions
export default productSlice.reducer
