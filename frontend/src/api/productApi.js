import api from './axios'

export const productApi = {
  getProducts: (params) => api.get('/products/', { params }),
  getProduct: (slug) => api.get(`/products/${slug}/`),
  getFeatured: () => api.get('/products/featured/'),
  getNewArrivals: () => api.get('/products/new_arrivals/'),
  getBestSelling: () => api.get('/products/best_selling/'),
  getTopRated: () => api.get('/products/top_rated/'),
  getRelated: (slug) => api.get(`/products/${slug}/related/`),
  getCategories: (params) => api.get('/products/categories/', { params }),
  getBrands: (params) => api.get('/products/brands/', { params }),

  // Admin
  createProduct: (data) => api.post('/products/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id, data) => api.patch(`/products/${id}/`, data),
  deleteProduct: (id) => api.delete(`/products/${id}/`),
  createCategory: (data) => api.post('/products/categories/', data),
  updateCategory: (slug, data) => api.patch(`/products/categories/${slug}/`, data),
  deleteCategory: (slug) => api.delete(`/products/categories/${slug}/`),
  createBrand: (data) => api.post('/products/brands/', data),
  updateBrand: (slug, data) => api.patch(`/products/brands/${slug}/`, data),
  deleteBrand: (slug) => api.delete(`/products/brands/${slug}/`),
}
