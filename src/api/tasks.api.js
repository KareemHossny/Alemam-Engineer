import apiClient from './apiClient';
import {
  ensureBulkResult,
  ensureNullableObject,
  ensureObject,
  ensurePaginatedResult,
} from './apiHelpers';

const normalizeTaskFilters = (filtersOrDate) => {
  if (!filtersOrDate) {
    return undefined;
  }

  if (typeof filtersOrDate === 'string') {
    return { date: filtersOrDate };
  }

  return filtersOrDate;
};

export const getEngineerDashboardStats = async () => ensureObject(
  await apiClient.get('/engineer/dashboard/stats')
);

export const getEngineerDailyTasks = async (projectId, filters) => ensurePaginatedResult(
  await apiClient.get(`/engineer/daily-tasks/${projectId}`, {
    params: normalizeTaskFilters(filters),
  })
);

export const createDailyTask = async (taskData) => ensureNullableObject(
  await apiClient.post('/engineer/daily-tasks', taskData)
);

export const createDailyTasksBulk = async (tasks) => ensureBulkResult(
  await apiClient.post('/engineer/daily-tasks/bulk', tasks)
);

export const deleteDailyTask = async (taskId) => await apiClient.delete(`/engineer/daily-tasks/${taskId}`);

export const getEngineerMonthlyTasks = async (projectId, filters) => ensurePaginatedResult(
  await apiClient.get(`/engineer/monthly-tasks/${projectId}`, {
    params: normalizeTaskFilters(filters),
  })
);

export const createMonthlyTask = async (taskData) => ensureNullableObject(
  await apiClient.post('/engineer/monthly-tasks', taskData)
);

export const createMonthlyTasksBulk = async (tasks) => ensureBulkResult(
  await apiClient.post('/engineer/monthly-tasks/bulk', tasks)
);

export const deleteMonthlyTask = async (taskId) => await apiClient.delete(`/engineer/monthly-tasks/${taskId}`);
