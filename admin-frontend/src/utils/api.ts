export const API_BASE_URL = 'http://localhost:4000';

export const getAccessToken = () => localStorage.getItem('access_token');
export const setAccessToken = (token: string) => localStorage.setItem('access_token', token);
export const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
};

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    
    const token = getAccessToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });
    
    const data = await response.json();
    
    if (!response.ok) {
        if (response.status === 401) {
            clearTokens();
            window.location.href = '/login';
        }
        throw new Error(data?.error?.message || 'API request failed');
    }
    
    return data;
};
