import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAppSelector } from '@/store/hooks';

export function useCategories() {
    const { activeShop } = useAppSelector((state) => state.shops);
    const queryClient = useQueryClient();

    const { data: categories = [], isLoading: loading, error, refetch } = useQuery({
        queryKey: ['categories', activeShop?.id],
        queryFn: async () => {
            if (!activeShop?.id) return [];
            const { data } = await api.get(`/categories?shopId=${activeShop.id}`);
            return data || [];
        },
        enabled: !!activeShop?.id,
    });

    const createMutation = useMutation({
        mutationFn: (categoryData) => api.post('/categories', { ...categoryData, shopId: activeShop.id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', activeShop?.id] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, categoryData }) => api.put(`/categories/${id}`, categoryData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', activeShop?.id] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/categories/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', activeShop?.id] }),
    });

    return {
        categories,
        loading,
        error,
        fetchCategories: refetch,
        createCategory: createMutation.mutateAsync,
        updateCategory: (id, categoryData) => updateMutation.mutateAsync({ id, categoryData }),
        deleteCategory: deleteMutation.mutateAsync,
    };
}
