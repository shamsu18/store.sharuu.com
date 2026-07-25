/*
For local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
*/



// for host

const API_URL =
  import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: isForm ? options.headers : { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(payload?.message || 'Request failed.', response.status, payload?.details);
  return payload?.data ?? payload;
}

export const api = {
  publicBootstrap: () => request('/public/bootstrap'),
  getProduct: slug => request(`/public/products/${encodeURIComponent(slug)}`),
  validateCoupon: body => request('/public/coupons/validate', { method: 'POST', body: JSON.stringify(body) }),
  createOrder: body => request('/public/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrder: (id, token) => request(`/public/orders/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`),
  trackOrder: query => request(`/public/orders/track?query=${encodeURIComponent(query)}`),

  login: body => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  adminBootstrap: () => request('/admin/bootstrap'),
  saveProduct: body => request('/admin/products', { method: 'POST', body: JSON.stringify(body) }),
  deleteProduct: id => request(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  saveCategory: body => request('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
  reorderCategories: categories => request('/admin/categories/order', { method: 'PUT', body: JSON.stringify({ categories }) }),
  deleteCategory: id => request(`/admin/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  saveCoupon: body => request('/admin/coupons', { method: 'POST', body: JSON.stringify(body) }),
  deleteCoupon: id => request(`/admin/coupons/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  savePage: body => request('/admin/pages', { method: 'POST', body: JSON.stringify(body) }),
  deletePage: id => request(`/admin/pages/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  saveSettings: body => request('/admin/settings', { method: 'POST', body: JSON.stringify(body) }),
  updateOrder: (id, body) => request(`/admin/orders/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  uploadImages: files => {
    const form = new FormData();
    files.forEach(file => form.append('images', file));
    return request('/admin/uploads', { method: 'POST', body: form });
  }
};
