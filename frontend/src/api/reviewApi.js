import api from './axios'

export const reviewApi = {
  getProductReviews: (productId, params) =>
    api.get('/reviews/product_reviews/', { params: { product_id: productId, ...params } }),
  createReview: (data) => api.post('/reviews/', data),
  updateReview: (id, data) => api.patch(`/reviews/${id}/`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}/`),
}
