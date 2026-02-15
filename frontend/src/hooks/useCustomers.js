import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAppSelector } from '@/store/hooks';

export const useCustomers = () => {
    const { activeShop } = useAppSelector((state) => state.shops);
    const queryClient = useQueryClient();

    const { data: customers = [], isLoading, refetch } = useQuery({
        queryKey: ['customers', activeShop?.id],
        queryFn: async () => {
            if (!activeShop) return [];
            const { data } = await api.get(`/customers?shopId=${activeShop.id}`);
            return data;
        },
        enabled: !!activeShop,
    });

    const createCustomer = useMutation({
        mutationFn: async (customerData) => {
            if (!activeShop) throw new Error("No active shop");
            const { data } = await api.post('/customers', { ...customerData, shopId: activeShop.id });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers', activeShop?.id] });
        },
    });

    const updateCustomer = useMutation({
        mutationFn: async ({ id, ...updates }) => {
            console.log('=== FRONTEND UPDATE CUSTOMER ===');
            console.log('Customer ID:', id);
            console.log('Updates:', updates);
            const { data } = await api.put(`/customers/${id}`, updates);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers', activeShop?.id] });
        },
    });

    const deleteCustomer = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/customers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers', activeShop?.id] });
        },
    });

    return {
        customers,
        isLoading,
        fetchCustomers: refetch,
        createCustomer,
        updateCustomer,
        deleteCustomer,
    };
};

export const useCustomerPricing = (customerId) => {
    const [pricing, setPricing] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPricing = useCallback(async () => {
        if (!customerId) return;
        setIsLoading(true);
        try {
            const { data } = await api.get(`/customers/${customerId}/pricing`);
            setPricing(data || []);
        } catch (error) {
            console.error('Error fetching customer pricing:', error);
        } finally {
            setIsLoading(false);
        }
    }, [customerId]);

    const upsertPricing = useMutation({
        mutationFn: async (data) => {
            try {
                // Ensure backend receives camelCase or snake_case as it supports both now
                const payload = {
                    productId: data.product_id || data.productId,
                    customPrice: data.custom_price || data.customPrice,
                    discountPercentage: data.discount_percentage || data.discountPercentage
                };
                const result = await api.post(`/customers/${customerId}/pricing`, payload);
                return result.data;
            } catch (error) {
                console.error('Error upserting pricing:', error);
                throw error;
            }
        },
        onSuccess: () => {
            fetchPricing();
        }
    });

    const deletePricing = useMutation({
        mutationFn: async (pricingId) => {
            try {
                await api.delete(`/customers/${customerId}/pricing/${pricingId}`);
            } catch (error) {
                console.error('Error deleting pricing:', error);
                throw error;
            }
        },
        onSuccess: () => {
            fetchPricing();
        }
    });

    return {
        pricing,
        isLoading,
        fetchPricing,
        upsertPricing,
        deletePricing,
    };
};

export const useCustomerHistory = (customerId) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!customerId) return;
        setIsLoading(true);
        try {
            const { data } = await api.get(`/customers/${customerId}/history`);
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching customer history:', error);
        } finally {
            setIsLoading(false);
        }
    }, [customerId]);


    const totalSpent = (history || []).reduce((sum, sale) => sum + parseFloat(sale.totalAmount || sale.grandTotal || 0), 0);
    const totalOrders = (history || []).length;

    return {
        history,
        isLoading,
        fetchHistory,
        totalSpent,
        totalOrders,
    };
};
