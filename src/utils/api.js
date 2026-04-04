import axios from 'axios';

// إنشاء instance مخصص لـ axios
const api = axios.create({
  baseURL: 'https://alemam-backend.vercel.app/api', 
  timeout: 15000,
  withCredentials: true,
});

const shouldRedirectToLogin = (error) => {
  if (error.response?.status !== 401) {
    return false;
  }

  if (error.config?.skipAuthRedirect) {
    return false;
  }

  if (error.config?.url?.includes('/login')) {
    return false;
  }

  return window.location.pathname !== '/login';
};

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (shouldRedirectToLogin(error)) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// وظائف الـ Engineer
export const engineerAPI = {
  // Authentication
  login: (credentials) => api.post('/engineer/login', credentials, { skipAuthRedirect: true }),
  logout: () => api.post('/engineer/logout'),
  getCurrentUser: () => api.get('/engineer/me', { skipAuthRedirect: true }),
  
  // Projects
  getMyProjects: () => api.get('/engineer/projects'),
  
  // Daily Tasks
  getDailyTasks: (projectId, date) => api.get(`/engineer/daily-tasks/${projectId}`, {
    params: date ? { date } : undefined,
  }),
  addDailyTask: (taskData) => api.post('/engineer/daily-tasks', taskData),
  addDailyTasksBulk: (tasks) => api.post('/engineer/daily-tasks/bulk', tasks),
  deleteDailyTask: (taskId) => api.delete(`/engineer/daily-tasks/${taskId}`),
  
  // Monthly Tasks
  getMonthlyTasks: (projectId) => api.get(`/engineer/monthly-tasks/${projectId}`),
  addMonthlyTask: (taskData) => api.post('/engineer/monthly-tasks', taskData),
  addMonthlyTasksBulk: (tasks) => api.post('/engineer/monthly-tasks/bulk', tasks),
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

export default api;
