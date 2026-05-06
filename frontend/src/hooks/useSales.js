import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export function useSales() {
    const [loading, setLoading] = useState(false);
    const { activeShop } = useAppSelector((state) => state.shops);

    const createSale = async (data) => {
        if (!activeShop) {
            console.error("No active shop found in createSale");
            throw new Error("No active shop");
        }
        setLoading(true);
        try {
            
            const paymentModeMap = {
                'cash': 'CASH',
                'card': 'NET_BANKING',
                'mobile': 'UPI',
                'other': 'CASH'
            };

            const itemsPayload = data.items.map(item => {
                const pid = item.product_id || item.productId || item.id;
                if (!pid) {
                    console.error("Missing productId for item:", item);
                    throw new Error("Invalid item: Missing product ID");
                }
                return {
                    productId: pid,
                    quantity: Number(item.quantity),
                    price: Number(item.unit_price || item.price),
                    taxRate: 18 
                };
            });

            const payload = {
                shopId: activeShop.id,
                customerId: data.customer?.id || null, 
                customerName: data.customer?.name || "Walk-in Customer",
                customerMobile: data.customer?.phone || "",
                paymentMode: paymentModeMap[data.payment_method] || 'CASH',
                notes: data.notes || "",
                items: itemsPayload
            };

            console.log("Sending Sale Payload:", payload);

            const { data: sale } = await api.post('/billing', payload);

            toast.success("Sale completed successfully", {
                description: `Invoice #${sale.billNumber} created`
            });

            return sale;
        } catch (error) {
            console.error('Error creating sale:', error);
            
            if (error.response) {
                console.error("Server Error Response:", error.response.data);
                toast.error(error.response.data.error || "Failed to process sale (Server Error)");
            } else if (error.request) {
                console.error("No response received:", error.request);
                toast.error("Network error: No response from server");
            } else {
                console.error("Request setup error:", error.message);
                toast.error(error.message || "Failed to process sale");
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchSales = useCallback(async (filters = {}) => {
        if (!activeShop) return [];
        setLoading(true);
        try {
            const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null) acc[key] = value;
                return acc;
            }, {});
            const params = new URLSearchParams({
                shopId: activeShop.id,
                ...cleanFilters
            });
            const { data } = await api.get(`/billing?${params.toString()}`);
            return data;
        } catch (error) {
            console.error('Error fetching sales:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [activeShop]);

    const cancelSale = async (saleId) => {
        setLoading(true);
        try {
            const { data } = await api.post(`/billing/${saleId}/cancel`);
            toast.success("Sale cancelled successfully");
            return data;
        } catch (error) {
            console.error('Error cancelling sale:', error);
            toast.error("Failed to cancel sale");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createSale,
        fetchSales,
        cancelSale,
    };
}
