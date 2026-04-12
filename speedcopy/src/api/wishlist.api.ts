import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type { Product } from '../types/catalog';
import { useAuthStore } from '../state_mgmt/store/authStore';

// Transform function to map backend response to Product type
const transformProduct = (prod: any): Product => ({
    id: prod.id,
    subCategoryId: prod.subCategoryId ?? prod.sub_category_id,
    slug: prod.slug,
    title: prod.title,
    description: prod.description,
    customizationMode: prod.customizationMode ?? prod.customization_mode,
    primaryCTA: prod.primaryCTA ?? prod.primary_cta,
    thumbnailUrl: prod.thumbnailUrl ?? prod.thumbnail_url,
    isActive: prod.isActive ?? prod.is_active,
    startingPrice: prod.startingPrice ? parseFloat(prod.startingPrice) : undefined,
    createdAt: prod.createdAt ?? prod.created_at,
    updatedAt: prod.updatedAt ?? prod.updated_at,
});

/**
 * useWishlistQuery
 * Fetches the user's wishlisted products.
 * Only runs when the user is authenticated.
 */
export const useWishlistQuery = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useQuery({
        queryKey: ['wishlist'],
        queryFn: async (): Promise<Product[]> => {
            const response = await apiClient.get('/api/wishlist');
            return response.data.data.map(transformProduct);
        },
        // Only fetch when we have a valid token
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};

/**
 * useToggleWishlistMutation
 * Toggles a product in the wishlist with optimistic update support.
 */
export const useToggleWishlistMutation = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useMutation({
        mutationFn: async (productId: string) => {
            if (!isAuthenticated) {
                throw new Error('Not authenticated');
            }
            const response = await apiClient.post('/api/wishlist/toggle', { productId });
            return response.data as { success: boolean; added: boolean };
        },
        onMutate: async (productId: string) => {
            // Optimistic update: cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['wishlist'] });

            // Snapshot the previous value
            const previousWishlist = queryClient.getQueryData<Product[]>(['wishlist']);

            // Optimistically update the cache
            queryClient.setQueryData<Product[]>(['wishlist'], (old) => {
                if (!old) return old;
                const exists = old.some((p) => p.id === productId);
                if (exists) {
                    return old.filter((p) => p.id !== productId);
                }
                // We don't have the full product here for adding, so just invalidate
                return old;
            });

            return { previousWishlist };
        },
        onError: (_err, _productId, context) => {
            // Roll back on error
            if (context?.previousWishlist) {
                queryClient.setQueryData(['wishlist'], context.previousWishlist);
            }
        },
        onSettled: () => {
            // Always refetch to sync with server
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        },
    });
};
