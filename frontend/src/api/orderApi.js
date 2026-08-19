import api from './axios'

export const orderApi = {
  getOrders: (params) => api.get('/orders/', { params }),
  getOrder: (id) => api.get(`/orders/${id}/`),
  createOrder: (data) => api.post('/orders/', data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel/`),
  deleteOrder: (id) => api.delete(`/orders/${id}/`),
  updateOrderStatus: (id, data) => api.patch(`/orders/${id}/update_status/`, data),
}
