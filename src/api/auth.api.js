import apiClient from './apiClient';
import { ensureUserPayload } from './apiHelpers';

const buildAuthConfig = () => ({
  skipAuthRedirect: true,
  suppressAuthEvent: true,
});

export const authAPI = {
  login: async (credentials) => ensureUserPayload(
    await apiClient.post('/engineer/login', credentials, buildAuthConfig())
  ),
  logout: async () => await apiClient.post('/engineer/logout', {}, buildAuthConfig()),
  getCurrentUser: async () => ensureUserPayload(
    await apiClient.get('/engineer/me', buildAuthConfig())
  ),
};
