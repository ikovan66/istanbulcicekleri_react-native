/**
 * Global Axios Interceptor
 * ─────────────────────────────────────────────────────
 * Auth.js instance dışında düz axios.get/post kullanan
 * çağrılar için X-Tenant-Db header'ını otomatik ekler.
 *
 * App.tsx'te uygulama başlatılırken çağrılır:
 *   import setupGlobalInterceptors from './src/config/axiosConfig';
 *   setupGlobalInterceptors();
 * ─────────────────────────────────────────────────────
 */

import axios from 'axios';
import API_CONFIG from './apiConfig';

const setupGlobalInterceptors = () => {
  axios.interceptors.request.use((config) => {
    const url = config.url || '';

    // Sadece bizim API'lerimize giden isteklere tenant header ekle
    const isOurApi = [
      API_CONFIG.authApi,
      API_CONFIG.frontendApi,
      API_CONFIG.basketApi,
    ].some(base => url.startsWith(base));

    if (isOurApi) {
      config.headers = config.headers || {};
      config.headers['X-Tenant-Db'] = API_CONFIG.tenantDb;
    }

    return config;
  });
};

export default setupGlobalInterceptors;
