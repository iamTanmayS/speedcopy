import { apiClient } from './apiClient';

interface RequestOTPPayload {
    email: string;
}

interface VerifyOTPPayload {
    email: string;
    otp: string;
}

export const requestOTP = async (data: RequestOTPPayload) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
};

export const verifyOTP = async (data: VerifyOTPPayload) => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
};
