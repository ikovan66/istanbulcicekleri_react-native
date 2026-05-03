// Auth.js — Multi-Tenant Axios Instance
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/apiConfig';

// baseURL merkezi config'den gelir.
// Axios, URL'iniz http:// veya https:// ile başlıyorsa, baseURL'i eklemez.
// Böylece tek instance ile farklı endpoint'lere rahatça istek atabilir,
// authorization ve refresh mekanizmasını ortak kullanabilirsiniz.

const Auth = axios.create({
  baseURL: `${API_CONFIG.authApi}/api/Auth`
});

// 1) Request Interceptor: Her isteğe token + tenant header ekle
Auth.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Multi-tenant header — backend TenantService bu header'dan DB seçer
    config.headers['X-Tenant-Db'] = API_CONFIG.tenantDb;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2) Response Interceptor: 401 alırsak refresh token dene
Auth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Sonsuz döngüye girmesin diye
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (refreshToken) {
          // Refresh endpoint'ine gidelim (Tam URL kullanıyoruz)
          const refreshResponse = await axios.post(
            `${API_CONFIG.authApi}/api/Auth/refresh`,
            { refreshToken },
            { headers: { 'X-Tenant-Db': API_CONFIG.tenantDb } }
          );

          if (refreshResponse.data) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

            // Yeni token'ları kaydet
            await AsyncStorage.setItem('accessToken', newAccessToken);
            await AsyncStorage.setItem('refreshToken', newRefreshToken);

            // Orijinal isteği tekrar dene
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return Auth(originalRequest);
          }
        }
      } catch (refreshErr) {
        console.log('Token yenileme hatası:', refreshErr);
        // İstenirse kullanıcının oturumunu kapatıp login ekranına yönlendirebilirsiniz
      }
    }

    return Promise.reject(error);
  }
);

export default Auth;