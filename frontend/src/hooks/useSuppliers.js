import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '../store/useStore';

export function useSuppliers() {
    const { toast } = useToast();
    const { activeShop } = useStore();
    const queryClient = useQueryClient();

    const { data: suppliers = [], isLoading: suppliersLoading, refetch: fetchSuppliers } = useQuery({
        queryKey: ['suppliers', activeShop?.id],
        queryFn: async () => {
            if (!activeShop?.id) return [];
            const { data } = await api.get('/suppliers', { params: { shopId: activeShop.id } });
            return data || [];
        },
        enabled: !!activeShop?.id,
    });

    const { data: purchaseOrders = [], isLoading: poLoading, refetch: fetchPurchaseOrders } = useQuery({
        queryKey: ['purchase-orders', activeShop?.id],
        queryFn: async () => {
            if (!activeShop?.id) return [];
            const { data } = await api.get('/purchase-orders', { params: { shopId: activeShop.id } });
            return data || [];
        },
        enabled: !!activeShop?.id,
    });

    const createSupplierMutation = useMutation({
        mutationFn: (supplier) => api.post('/suppliers', { ...supplier, shopId: activeShop.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers', activeShop?.id] });
            toast({ title: 'Supplier created successfully' });
        },
        onError: (error) => toast({ title: 'Error creating supplier', description: error.response?.data?.error || error.message, variant: 'destructive' }),
    });

    const updateSupplierMutation = useMutation({
        mutationFn: ({ id, updates }) => api.put(`/suppliers/${id}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers', activeShop?.id] });
            toast({ title: 'Supplier updated successfully' });
        },
        onError: (error) => toast({ title: 'Error updating supplier', description: error.response?.data?.error || error.message, variant: 'destructive' }),
    });

    const deleteSupplierMutation = useMutation({
        mutationFn: (id) => api.delete(`/suppliers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers', activeShop?.id] });
            toast({ title: 'Supplier deleted successfully' });
        },
        onError: (error) => toast({ title: 'Error deleting supplier', description: error.response?.data?.error || error.message, variant: 'destructive' }),
    });

    const createPOMutation = useMutation({
        mutationFn: (payload) => api.post('/purchase-orders', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', activeShop?.id] });
            toast({ title: 'Purchase order created successfully' });
        },
        onError: (error) => toast({ title: 'Error creating purchase order', description: error.response?.data?.error || error.message, variant: 'destructive' }),
    });

    const updatePOStatusMutation = useMutation({
        mutationFn: ({ id, status }) => api.patch(`/purchase-orders/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', activeShop?.id] });
            toast({ title: `Purchase order updated` });
        },
    });

    return {
        suppliers,
        purchaseOrders,
        loading: suppliersLoading || poLoading,
        fetchSuppliers,
        createSupplier: createSupplierMutation.mutateAsync,
        updateSupplier: (id, updates) => updateSupplierMutation.mutateAsync({ id, updates }),
        deleteSupplier: deleteSupplierMutation.mutateAsync,
        fetchPurchaseOrders,
        createPurchaseOrder: (supplierId, items, expectedDelivery, notes) => 
            createPOMutation.mutateAsync({
                shopId: activeShop.id,
                supplier_id: supplierId,
                items: items.map(item => ({ productId: item.productId, quantity: item.quantity, costPrice: item.unitCost })),
                expected_delivery_date: expectedDelivery,
                notes
            }),
        updatePurchaseOrderStatus: (id, status) => updatePOStatusMutation.mutateAsync({ id, status }),
        // ... existing legacy helpers if needed
        fetchSupplierProducts: async (id) => (await api.get(`/suppliers/${id}/products`)).data,
        linkProductToSupplier: async (supplierId, productId, costPrice, supplierSku, isPreferred) => {
            await api.post(`/suppliers/${supplierId}/products`, { productId, costPrice, supplierSku, isPreferred });
            queryClient.invalidateQueries({ queryKey: ['suppliers', activeShop?.id] });
            return true;
        },
        unlinkProduct: async (id) => {
            await api.delete(`/suppliers/products/${id}`);
            queryClient.invalidateQueries({ queryKey: ['suppliers', activeShop?.id] });
            return true;
        }
    };
}
