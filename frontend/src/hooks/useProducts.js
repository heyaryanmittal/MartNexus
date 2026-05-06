import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAppSelector } from '@/store/hooks';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { activeShop } = useAppSelector((state) => state.shops);

    
    const getEffectivePrice = useCallback((product) => {
        
        const finalPrice = product.price || product.sellingPrice || 0;
        return { price: finalPrice, hasCustomPrice: false };
    }, []);

    const fetchProducts = useCallback(async () => {
        if (!activeShop) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/products?shopId=${activeShop.id}`);
            
            const transformedData = (data || []).map(product => {
                
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
            setProducts(transformedData);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [activeShop]);

    const getProduct = async (id) => {
        
        try {
            
            
            return products.find(p => p.id === id) || null;
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    };

    const createProduct = async (productData) => {
        if (!activeShop) throw new Error("No active shop selected");
        try {
            await api.post('/products', { ...productData, shopId: activeShop.id });
            fetchProducts(); 
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            await api.put(`/products/${id}`, productData);
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const deleteProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    };

    return {
        products,
        loading,
        fetchProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
    };
}
