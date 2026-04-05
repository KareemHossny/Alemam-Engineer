import apiClient from './apiClient';
import { ensureArray } from './apiHelpers';

export const getEngineerProjects = async () => ensureArray(await apiClient.get('/engineer/projects'));
