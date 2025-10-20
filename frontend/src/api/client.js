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
  // create envía un nuevo producto al backend
  create: (data) => api.post('/products', data),
  // list recupera productos con filtros opcionales
  list: (params) => api.get('/products', { params }),
  // getById obtiene un producto concreto por id
  getById: (id) => api.get(`/products/${id}`),
  // update modifica un producto existente
  update: (id, data) => api.put(`/products/${id}`, data),
  // delete elimina un producto por id
  delete: (id) => api.delete(`/products/${id}`),
  // getByBarcode busca producto por código de barras
  getByBarcode: (barcode) => api.get(`/utils/product-by-barcode/${barcode}`),
};

export const inventoryApi = {
  // arrival registra una entrada de stock
  arrival: (data) => api.post('/inventory/arrival', data),
  // sale procesa una venta
  sale: (data) => api.post('/inventory/sale', data),
  // return gestiona devoluciones
  return: (data) => api.post('/inventory/return', data),
  // adjust aplica variaciones manuales de stock
  adjust: (data) => api.post('/inventory/adjust', data),
  // getLowStock obtiene productos con stock crítico
  getLowStock: () => api.get('/inventory/low-stock'),
  // exportLowStock pide la exportación CSV de stock bajo
  exportLowStock: () => api.get('/inventory/low-stock', { params: { format: 'csv' } }),
};

export default api;
