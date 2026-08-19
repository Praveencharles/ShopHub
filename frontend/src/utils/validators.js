export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters'
  return null
}

export const validatePhone = (phone) => {
  const re = /^[+]?[\d\s-]{10,15}$/
  return re.test(phone)
}
