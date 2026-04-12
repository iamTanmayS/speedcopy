import { useMutation } from '@tanstack/react-query';
import { updateProfile } from '../user.api';
import { useAuthStore } from '../../state_mgmt/store/authStore';

export const useUpdateProfile = () => {
    const updateUser = useAuthStore((state: any) => state.updateUser);

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (response: any) => {
            if (response?.data) {
                updateUser({ ...response.data, profileComplete: true });
            } else {
                updateUser({ profileComplete: true });
            }
        },
    });
};
