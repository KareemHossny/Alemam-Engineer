import axios from 'axios';

// إنشاء instance مخصص لـ axios
const api = axios.create({
  baseURL: 'https://alemam-backend.vercel.app/api', 
  timeout: 15000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('engineerToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('engineerToken');
      localStorage.removeItem('engineerInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// وظائف الـ Engineer
export const engineerAPI = {
  // Authentication
  login: (credentials) => api.post('/engineer/login', credentials),
  logout: () => api.post('/engineer/logout'),
  
  // Projects
  getMyProjects: () => api.get('/engineer/projects'),
  
  // Daily Tasks
  getDailyTasks: (projectId) => api.get(`/engineer/daily-tasks/${projectId}`),
  addDailyTask: (taskData) => api.post('/engineer/daily-tasks', taskData),
  deleteDailyTask: (taskId) => api.delete(`/engineer/daily-tasks/${taskId}`),
  
  // Monthly Tasks
  getMonthlyTasks: (projectId) => api.get(`/engineer/monthly-tasks/${projectId}`),
  addMonthlyTask: (taskData) => api.post('/engineer/monthly-tasks', taskData),
  deleteMonthlyTask: (taskId) => api.delete(`/engineer/monthly-tasks/${taskId}`),
};

// وظيفة للتحقق من حالة السيرفر
export const checkServerStatus = async () => {
  try {
    const response = await axios.get('https://alemam-backend.vercel.app/health', { 
      timeout: 3000 
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// وظيفة للحصول على معلومات المهندس من الـ Token
export const getEngineerInfo = () => {
  try {
    const token = localStorage.getItem('engineerToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        name: payload.name,
        email: payload.email,
        id: payload.id
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting engineer info:', error);
    return null;
  }
};

export default api;