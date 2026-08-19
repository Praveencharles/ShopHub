export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    inactive: 'bg-red-100 text-red-800',
    discontinued: 'bg-orange-100 text-orange-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300x300?text=No+Image'
  if (url.startsWith('http')) return url
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  return `${API_URL.replace('/api', '')}${url}`
}

export const categoryImages = {
  'electronics': '/electronis.jpg',
  'fashion': '/fashion.jpg',
  'home & kitchen': '/home&kitchen.jpg',
  'beauty & personal care': '/beauty&personalCare.jpg',
  'sports & fitness': '/sports&fitness.jpg',
  'books & stationery': '/books&stationary.jpg',
  'toys & games': '/toys&games.jpg',
  'automotive': '/automotive.jpg',
  'grocery & gourmet': '/grocery&gourmet.jpg',
  'health & wellness': '/health&wellness.jpg',
}

export const getProductImageUrl = (product) => {
  const categoryName = product?.category_name || product?.category?.name
  const key = (categoryName || '').toLowerCase().trim()
  if (categoryImages[key]) return categoryImages[key]
  return getImageUrl(product?.primary_image)
}

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
