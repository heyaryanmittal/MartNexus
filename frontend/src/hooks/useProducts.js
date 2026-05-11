import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAppSelector } from '@/store/hooks';

export function useProducts() {
    const { activeShop } = useAppSelector((state) => state.shops);
    const queryClient = useQueryClient();

    const { data: products = [], isLoading: loading, error, refetch } = useQuery({
        queryKey: ['products', activeShop?.id],
        queryFn: async () => {
            if (!activeShop?.id) return [];
            const { data } = await api.get(`/products?shopId=${activeShop.id}`);
            
            return (data || []).map(product => {
                const rawSellingPrice = product.sellingPrice || product.price || product.selling_price;
                const sPrice = parseFloat(rawSellingPrice) || 0;

                const rawCostPrice = product.costPrice || product.cost || product.cost_price;
                const cPrice = parseFloat(rawCostPrice) || 0;

                const stockQty = parseFloat(product.stock) || 0;
                const rLevel = parseFloat(product.reorderLevel) || parseFloat(product.reorder_level) || 5;
                const activeStatus = product.isActive !== undefined ? product.isActive : (product.is_active !== undefined ? product.is_active : true);

                return {
                    ...product,
                    price: sPrice,
                    sellingPrice: sPrice,
                    costPrice: cPrice,
                    cost: cPrice,
                    stock: stockQty,
                    reorderLevel: rLevel,
                    reorder_level: rLevel,
                    isActive: activeStatus,
                    is_active: activeStatus
                };
            });
        },
        enabled: !!activeShop?.id,
    });

    const createMutation = useMutation({
        mutationFn: (productData) => api.post('/products', { ...productData, shopId: activeShop.id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', activeShop?.id] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, productData }) => api.put(`/products/${id}`, productData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', activeShop?.id] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/products/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', activeShop?.id] }),
    });

    const getProduct = useCallback(async (id) => {
        return products.find(p => p.id === id) || null;
    }, [products]);

    return {
        products,
        loading,
        error,
        fetchProducts: refetch,
        getProduct,
        createProduct: createMutation.mutateAsync,
        updateProduct: (id, productData) => updateMutation.mutateAsync({ id, productData }),
        deleteProduct: deleteMutation.mutateAsync,
    };
}
