import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }).then(res => res.data),
  
  getCurrentUser: () =>
    api.get('/auth/me').then(res => res.data.user),
  
  updatePreferences: (preferences: any) =>
    api.put('/auth/preferences', preferences).then(res => res.data),
};

// Clothing Items API
export const itemsAPI = {
  upload: (formData: FormData) =>
    api.post('/items/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
  
  getUserItems: (userId: string, filters?: any) =>
    api.get(`/items/user/${userId}`, { params: filters }).then(res => res.data),
  
  getItem: (id: string) =>
    api.get(`/items/${id}`).then(res => res.data),
  
  updateItem: (id: string, data: any) =>
    api.put(`/items/${id}`, data).then(res => res.data),
  
  updateWashStatus: (id: string, isInWash: boolean) =>
    api.put(`/items/${id}/wash-status`, { isInWash }).then(res => res.data),
  
  deleteItem: (id: string) =>
    api.delete(`/items/${id}`).then(res => res.data),
  
  getItemsByCategory: (category: string, filters?: any) =>
    api.get(`/items/category/${category}`, { params: filters }).then(res => res.data),
};

// Outfits API
export const outfitsAPI = {
  create: (data: any) =>
    api.post('/outfits/create', data).then(res => res.data),
  
  getUserOutfits: (userId: string, filters?: any) =>
    api.get(`/outfits/user/${userId}`, { params: filters }).then(res => res.data),
  
  getOutfit: (id: string) =>
    api.get(`/outfits/${id}`).then(res => res.data),
  
  updateOutfit: (id: string, data: any) =>
    api.put(`/outfits/${id}`, data).then(res => res.data),
  
  deleteOutfit: (id: string) =>
    api.delete(`/outfits/${id}`).then(res => res.data),
  
  markAsWorn: (id: string) =>
    api.post(`/outfits/${id}/wear`).then(res => res.data),
  
  getStats: (userId: string) =>
    api.get(`/outfits/stats/${userId}`).then(res => res.data),
  
  getRandom: (userId: string, filters?: any) =>
    api.get(`/outfits/random/${userId}`, { params: filters }).then(res => res.data),
};

// Laundry API
export const laundryAPI = {
  addItems: (data: any) =>
    api.post('/laundry/add-items', data).then(res => res.data),
  
  getUserLaundry: (userId: string, filters?: any) =>
    api.get(`/laundry/user/${userId}`, { params: filters }).then(res => res.data),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/laundry/${id}/status`, { status }).then(res => res.data),
  
  removeItems: (id: string, itemIds: string[]) =>
    api.delete(`/laundry/${id}/items`, { data: { itemIds } }).then(res => res.data),
  
  deleteEntry: (id: string) =>
    api.delete(`/laundry/${id}`).then(res => res.data),
  
  getStats: (userId: string) =>
    api.get(`/laundry/stats/${userId}`).then(res => res.data),
  
  getOverdue: (userId: string) =>
    api.get(`/laundry/overdue/${userId}`).then(res => res.data),
};

// AI API
export const aiAPI = {
  suggestOutfits: (data: any) =>
    api.post('/ai/suggest-outfits', data).then(res => res.data),
  
  analyzeOutfit: (data: any) =>
    api.post('/ai/analyze-outfit', data).then(res => res.data),
  
  getStyleRecommendations: () =>
    api.get('/ai/style-recommendations').then(res => res.data),
};

export default api;
