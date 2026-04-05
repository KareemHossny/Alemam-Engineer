import apiClient, { AUTH_REQUIRED_EVENT } from '../api/apiClient';
import { authAPI } from '../api/auth.api';
import { getEngineerProjects } from '../api/projects.api';
import {
  createDailyTask,
  createDailyTasksBulk,
  createMonthlyTask,
  createMonthlyTasksBulk,
  deleteDailyTask,
  deleteMonthlyTask,
  getEngineerDailyTasks,
  getEngineerDashboardStats,
  getEngineerMonthlyTasks,
} from '../api/tasks.api';
import { checkServerStatus } from '../api/system.api';

export const engineerAPI = {
  login: authAPI.login,
  logout: authAPI.logout,
  getCurrentUser: authAPI.getCurrentUser,
  getMyProjects: getEngineerProjects,
  getDashboardStats: getEngineerDashboardStats,
  getDailyTasks: getEngineerDailyTasks,
  addDailyTask: createDailyTask,
  addDailyTasksBulk: createDailyTasksBulk,
  deleteDailyTask,
  getMonthlyTasks: getEngineerMonthlyTasks,
  addMonthlyTask: createMonthlyTask,
  addMonthlyTasksBulk: createMonthlyTasksBulk,
  deleteMonthlyTask,
};

export { AUTH_REQUIRED_EVENT, checkServerStatus };

export default apiClient;
