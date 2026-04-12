import { apiClient } from './apiClient';

interface UpdateProfilePayload {
    name?: string;
    phone?: string;
    city?: string;
}

export const updateProfile = async (data: UpdateProfilePayload) => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
};
