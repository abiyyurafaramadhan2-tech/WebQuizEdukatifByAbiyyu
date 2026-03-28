import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

// Tambah token ke setiap request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('qg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('qg_token');
      localStorage.removeItem('qg_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
