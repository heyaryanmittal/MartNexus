import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '../store/useStore';

export function useSuppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [supplierProducts, setSupplierProducts] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { activeShop } = useStore();

    const fetchSuppliers = useCallback(async () => {
        if (!activeShop?.id) return [];
        setLoading(true);
        try {
            const { data } = await api.get('/suppliers', {
                params: { shopId: activeShop.id }
            });
            setSuppliers(data || []);
            return data || [];
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            toast({ title: 'Error fetching suppliers', description: error.response?.data?.error || error.message, variant: 'destructive' });
            return [];
        } finally {
            setLoading(false);
        }
    }, [activeShop?.id, toast]);

    const createSupplier = useCallback(async (supplier) => {
        if (!activeShop?.id) return null;
        try {
            const { data } = await api.post('/suppliers', {
                ...supplier,
                shopId: activeShop.id
            });
            toast({ title: 'Supplier created successfully' });
            return data;
        } catch (error) {
            toast({ title: 'Error creating supplier', description: error.response?.data?.error || error.message, variant: 'destructive' });
            return null;
        }
    }, [activeShop?.id, toast]);

    const updateSupplier = useCallback(async (id, updates) => {
        try {
            await api.put(`/suppliers/${id}`, updates);
            toast({ title: 'Supplier updated successfully' });
            return true;
        } catch (error) {
            toast({ title: 'Error updating supplier', description: error.response?.data?.error || error.message, variant: 'destructive' });
            return false;
        }
    }, [toast]);

    const deleteSupplier = useCallback(async (id) => {
        try {
            await api.delete(`/suppliers/${id}`);
            toast({ title: 'Supplier deleted successfully' });
            return true;
        } catch (error) {
            toast({ title: 'Error deleting supplier', description: error.response?.data?.error || error.message, variant: 'destructive' });
            return false;
        }
    }, [toast]);

    const fetchSupplierProducts = useCallback(async (supplierId) => {
        try {
            const { data } = await api.get(`/suppliers/${supplierId}/products`);
            setSupplierProducts(data); 
            return data;
        } catch (error) {
            console.error('Error fetching supplier products:', error);
            return [];
        }
    }, []);

    const linkProductToSupplier = useCallback(async (supplierId, productId, costPrice, supplierSku, isPreferred) => {
        try {
            await api.post(`/suppliers/${supplierId}/products`, {
                productId,
                costPrice,
                supplierSku,
                isPreferred
            });
            toast({ title: 'Product linked successfully' });
            return true;
        } catch (error) {
            console.error('Error linking product:', error);
            toast({ title: 'Failed to link product', description: error.response?.data?.error || error.message, variant: 'destructive' });
            return false;
        }
    }, [toast]);

    const unlinkProduct = useCallback(async (id) => {
        try {
            await api.delete(`/suppliers/products/${id}`);
            toast({ title: 'Product unlinked successfully' });
            return true;
        } catch (error) {
            console.error('Error unlinking product:', error);
            toast({ title: 'Failed to unlink product', description: error.response?.data?.error || error.message, variant: 'destructive' });
            return false;
        }
    }, [toast]);

    const fetchPurchaseOrders = useCallback(async () => {
        if (!activeShop?.id) return [];
        setLoading(true);
        try {
            const { data } = await api.get('/purchase-orders', {
                params: { shopId: activeShop.id }
            });
            setPurchaseOrders(data || []);
            return data || [];
        } catch (error) {
            toast({ title: 'Error fetching purchase orders', description: error.response?.data?.error || error.message, variant: 'destructive' });
            return [];
        } finally {
            setLoading(false);
        }
    }, [activeShop?.id, toast]);

    const fetchPurchaseOrderItems = useCallback(async (poId) => {
        
        try {
            const { data } = await api.get(`/purchase-orders/${poId}/items`);
            return data || [];
        } catch (error) {
            return [];
        }
    }, [toast]);

    const createPurchaseOrder = useCallback(async (supplierId, items, expectedDelivery, notes) => {
        if (!activeShop?.id) return null;
        try {
            const payload = {
                shopId: activeShop.id,
                supplier_id: supplierId,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    costPrice: item.unitCost
                })),
                expected_delivery_date: expectedDelivery,
                notes
            };
            console.log("Sending PO Payload:", payload);
            const { data } = await api.post('/purchase-orders', payload);
            toast({ title: 'Purchase order created successfully' });
            return data;
        } catch (error) {
            toast({ title: 'Error creating purchase order', description: error.response?.data?.error || error.message, variant: 'destructive' });
            return null;
        }
    }, [activeShop?.id, toast]);

    const updatePurchaseOrderStatus = useCallback(async (id, status) => {
        try {
            await api.patch(`/purchase-orders/${id}/status`, { status });
            toast({ title: `Purchase order ${status}` });
            return true;
        } catch (error) {
            toast({ title: 'Error updating status', description: error.response?.data?.error || error.message, variant: 'destructive' });
            return false;
        }
    }, [toast]);

    return {
        suppliers,
        supplierProducts,
        purchaseOrders,
        loading,
        fetchSuppliers,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        fetchSupplierProducts,
        linkProductToSupplier,
        unlinkProduct,
        fetchPurchaseOrders,
        fetchPurchaseOrderItems,
        createPurchaseOrder,
        updatePurchaseOrderStatus
    };
}
