import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
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
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  
  getProfile: () =>
    api.get('/api/auth/profile'),
  
  logout: () =>
    api.post('/api/auth/logout'),
};

// Rooms API
export const roomsAPI = {
  getRooms: (params) =>
    api.get('/api/rooms', { params }),
  
  getRoom: (id) =>
    api.get(`/api/rooms/${id}`),
  
  createRoom: (roomData) =>
    api.post('/api/rooms', roomData),
  
  updateRoom: (id, roomData) =>
    api.put(`/api/rooms/${id}`, roomData),
  
  deleteRoom: (id) =>
    api.delete(`/api/rooms/${id}`),
};

// Reservations API
export const reservationsAPI = {
  getReservations: () =>
    api.get('/api/reservations'),
  
  getReservation: (id) =>
    api.get(`/api/reservations/${id}`),
  
  createReservation: (reservationData) =>
    api.post('/api/reservations', reservationData),
  
  updateReservation: (id, reservationData) =>
    api.put(`/api/reservations/${id}`, reservationData),
  
  deleteReservation: (id) =>
    api.delete(`/api/reservations/${id}`),
};

// Users API (Admin only)
export const usersAPI = {
  getUsers: () =>
    api.get('/api/users'),
  
  getUser: (id) =>
    api.get(`/api/users/${id}`),
  
  createUser: (userData) =>
    api.post('/api/users', userData),
  
  updateUser: (id, userData) =>
    api.put(`/api/users/${id}`, userData),
  
  deleteUser: (id) =>
    api.delete(`/api/users/${id}`),
};

// Contact API
export const contactAPI = {
  createContact: (data) => api.post('/contact', data),
  getContacts: () => api.get('/api/contact'),
  getContact: (id) => api.get(`/api/contact/${id}`),
  updateContact: (id, contactData) => api.put(`/api/contact/${id}`, contactData),
  deleteContact: (id) => api.delete(`/api/contact/${id}`)
};

export default api;
