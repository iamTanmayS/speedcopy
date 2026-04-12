import axios from 'axios';
import { useAuthStore } from '../state_mgmt/store/authStore';
import { API_BASE_URL } from '../config/env';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
