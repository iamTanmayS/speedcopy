import { useMutation } from '@tanstack/react-query';
import { requestOTP, verifyOTP } from '../auth.api';
import { useAuthStore } from '../../state_mgmt/store/authStore';

export const useRequestOTP = () => {
    return useMutation({
        mutationFn: requestOTP,
    });
};

export const useVerifyOTP = () => {
    const setAuth = useAuthStore((state: any) => state.setAuth);

    return useMutation({
        mutationFn: verifyOTP,
        onSuccess: (response: any) => {
            // Check if response contains tokens and user
            if (response?.data?.tokens && response?.data?.user) {
                setAuth(response.data.user, response.data.tokens);
            }
        },
    });
};
