import api from './axios'

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist/'),
  addToWishlist: (productId) => api.post('/wishlist/', { product_id: productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}/`),
  moveToCart: (productId) => api.post(`/wishlist/move-to-cart/${productId}/`),
}
