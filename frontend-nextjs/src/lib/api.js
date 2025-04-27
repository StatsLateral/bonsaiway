import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('supabase.auth.token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Bonsai API endpoints
export const bonsaiApi = {
  // Get all bonsais for the current user
  getAllBonsais: () => api.get('/api/bonsais'),
  
  // Get a specific bonsai by ID
  getBonsai: (id) => api.get(`/api/bonsais/${id}`),
  
  // Create a new bonsai
  createBonsai: (data) => api.post('/api/bonsais', data),
  
  // Update a bonsai
  updateBonsai: (id, data) => api.put(`/api/bonsais/${id}`, data),
  
  // Delete a bonsai
  deleteBonsai: (id) => api.delete(`/api/bonsais/${id}`),
  
  // Upload an image for a bonsai
  uploadImage: (bonsaiId, formData) => 
    api.post(`/api/bonsais/${bonsaiId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Delete an image
  deleteImage: (bonsaiId, imageId) => 
    api.delete(`/api/bonsais/${bonsaiId}/images/${imageId}`),
};

// AI Insights API endpoints
export const aiApi = {
  // Get all insights for a bonsai
  getBonsaiInsights: (bonsaiId) => 
    api.get(`/api/bonsais/${bonsaiId}/insights`),
  
  // Create a new insight
  createInsight: (bonsaiId, data) => 
    api.post(`/api/bonsais/${bonsaiId}/insights`, data),
  
  // Delete an insight
  deleteInsight: (bonsaiId, insightId) => 
    api.delete(`/api/bonsais/${bonsaiId}/insights/${insightId}`),
};

export default api;
