import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export function useSales(filters = {}) {
    const { activeShop } = useAppSelector((state) => state.shops);
    const queryClient = useQueryClient();

    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') acc[key] = value;
        return acc;
    }, {});

    const query = useQuery({
        queryKey: ['sales', activeShop?.id, cleanFilters],
        queryFn: async () => {
            if (!activeShop?.id) return [];
            const params = new URLSearchParams({ shopId: activeShop.id, ...cleanFilters });
            const { data } = await api.get(`/billing?${params.toString()}`);
            return data || [];
        },
        enabled: !!activeShop?.id,
    });

    const createSaleMutation = useMutation({
        mutationFn: async (data) => {
            if (!activeShop) throw new Error("No active shop");
            const paymentModeMap = { 'cash': 'CASH', 'card': 'NET_BANKING', 'mobile': 'UPI', 'other': 'CASH' };
            const payload = {
                shopId: activeShop.id,
                customerId: data.customer?.id || null,
                customerName: data.customer?.name || "Walk-in Customer",
                customerMobile: data.customer?.phone || "",
                paymentMode: paymentModeMap[data.payment_method] || 'CASH',
                notes: data.notes || "",
                items: data.items.map(item => ({
                    productId: item.product_id || item.productId || item.id,
                    quantity: Number(item.quantity),
                    price: Number(item.unit_price || item.price),
                    taxRate: 18
                }))
            };
            const { data: sale } = await api.post('/billing', payload);
            return sale;
        },
        onSuccess: (sale) => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success("Sale completed successfully", { description: `Invoice #${sale.billNumber} created` });
        },
        onError: (error) => toast.error(error.response?.data?.error || "Failed to process sale"),
    });

    const cancelSaleMutation = useMutation({
        mutationFn: (saleId) => api.post(`/billing/${saleId}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success("Sale cancelled successfully");
        },
        onError: () => toast.error("Failed to cancel sale"),
    });

    return {
        sales: query.data || [],
        loading: query.isLoading || createSaleMutation.isPending || cancelSaleMutation.isPending,
        error: query.error,
        refetch: query.refetch,
        createSale: createSaleMutation.mutateAsync,
        cancelSale: cancelSaleMutation.mutateAsync,
    };
}
