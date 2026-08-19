import api from './axios'

export const paymentApi = {
  createRazorpayOrder: (orderId) => api.post('/payments/razorpay/order/', { order_id: orderId }),
  verifyRazorpay: (data) => api.post('/payments/razorpay/verify/', data),
  createStripeIntent: (orderId) => api.post('/payments/stripe/intent/', { order_id: orderId }),
}
