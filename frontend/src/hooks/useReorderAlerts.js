import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useStore } from '../store/useStore';

export const useReorderAlerts = () => {
    const { activeShop } = useStore();

    const { data: lowStockProducts = [], isLoading, refetch } = useQuery({
        queryKey: ['reorder-alerts', activeShop?.id],
        queryFn: async () => {
            if (!activeShop?.id) return [];

            const { data } = await api.get('/products/low-stock', {
                params: { shopId: activeShop.id }
            });

            
            return (data || []).map(product => ({
                ...product,
                reorder_level: product.reorderLevel,
                shortage: (product.reorderLevel || 5) - product.stock + 10,
                preferredSupplier: null, 
            }));
        },
        enabled: !!activeShop?.id
    });

    
    const suggestedPOs = lowStockProducts.reduce((acc, product) => {
        if (!product.preferredSupplier)
            return acc;

        const supplierId = product.preferredSupplier.supplier_id;
        if (!acc[supplierId]) {
            acc[supplierId] = {
                supplier_id: supplierId,
                supplier_name: product.preferredSupplier.supplier_name,
                items: [],
                total: 0,
            };
        }
        const quantity = Math.max(product.shortage, product.preferredSupplier.minimum_order_quantity || 1);
        const subtotal = quantity * product.preferredSupplier.cost_price;
        acc[supplierId].items.push({
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            current_stock: product.stock,
            reorder_level: product.reorder_level,
            suggested_quantity: quantity,
            unit_cost: product.preferredSupplier.cost_price,
            subtotal,
        });
        acc[supplierId].total += subtotal;
        return acc;
    }, {});

    return {
        lowStockProducts,
        suggestedPOs: Object.values(suggestedPOs),
        isLoading,
        refetch,
    };
};
