import api from './axios'

export const cartApi = {
  getCart: () => api.get('/cart/'),
  addToCart: (data) => api.post('/cart/add/', data),
  updateCartItem: (itemId, data) => api.put(`/cart/update/${itemId}/`, data),
  removeCartItem: (itemId) => api.delete(`/cart/remove/${itemId}/`),
  clearCart: () => api.delete('/cart/'),
}
