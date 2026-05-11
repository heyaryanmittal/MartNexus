import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import api from '@/lib/api';

export function useDashboard() {
    const { activeShop } = useStore();
    const queryClient = useQueryClient();

    const { data, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['dashboard', activeShop?.id],
        queryFn: async () => {
            if (!activeShop?.id) return null;
            const { data: result } = await api.get('/dashboard/stats', {
                params: { shopId: activeShop.id }
            });
            if (result.success) return result.data;
            throw new Error(result.message || 'Failed to fetch dashboard data');
        },
        enabled: !!activeShop?.id,
    });

    const refreshData = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: ['dashboard', activeShop?.id] });
        return refetch();
    }, [queryClient, activeShop?.id, refetch]);

    return { data, loading, error, refreshData };
}

