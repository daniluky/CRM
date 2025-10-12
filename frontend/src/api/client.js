import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const API_BASE_URL = API_URL;

export const productsApi = {
  create: (data) => api.post('/products', data),
  list: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getByBarcode: (barcode) => api.get(`/utils/product-by-barcode/${barcode}`),
};

export const inventoryApi = {
  arrival: (data) => api.post('/inventory/arrival', data),
  sale: (data) => api.post('/inventory/sale', data),
  return: (data) => api.post('/inventory/return', data),
  adjust: (data) => api.post('/inventory/adjust', data),
  getLowStock: () => api.get('/inventory/low-stock'),
  exportLowStock: () => api.get('/inventory/low-stock', { params: { format: 'csv' } }),
};

export default api;
