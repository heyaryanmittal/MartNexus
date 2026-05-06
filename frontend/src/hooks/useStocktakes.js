import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
export function useStocktakes() {
    const [stocktakes, setStocktakes] = useState([]);
    const [currentStocktake, setCurrentStocktake] = useState(null);
    const [stocktakeItems, setStocktakeItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchStocktakes = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('stocktakes')
                .select('*')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            setStocktakes(data || []);
        }
        catch (error) {
            console.error('Error fetching stocktakes:', error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const fetchStocktakeItems = useCallback(async (stocktakeId) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('stocktake_items')
                .select(`
          *,
          product:products(name, sku, barcode)
        `)
                .eq('stocktake_id', stocktakeId)
                .order('created_at', { ascending: true });
            if (error)
                throw error;
            setStocktakeItems(data || []);
        }
        catch (error) {
            console.error('Error fetching stocktake items:', error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const createStocktake = useCallback(async (notes) => {
        try {
            const { data: numberData, error: numberError } = await supabase
                .rpc('generate_stocktake_number');
            if (numberError)
                throw numberError;
            const { data: userData } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('stocktakes')
                .insert([{
                    stocktake_number: numberData,
                    notes,
                    created_by: userData.user?.id
                }])
                .select()
                .single();
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            console.error('Error creating stocktake:', error);
            throw error;
        }
    }, []);
    const initializeStocktakeItems = useCallback(async (stocktakeId, productIds) => {
        try {
            
            let query = supabase.from('products').select('id, stock').eq('is_active', true);
            if (productIds && productIds.length > 0) {
                query = query.in('id', productIds);
            }
            const { data: products, error: productsError } = await query;
            if (productsError)
                throw productsError;
            
            const items = (products || []).map(product => ({
                stocktake_id: stocktakeId,
                product_id: product.id,
                system_quantity: product.stock
            }));
            const { error } = await supabase
                .from('stocktake_items')
                .insert(items);
            if (error)
                throw error;
        }
        catch (error) {
            console.error('Error initializing stocktake items:', error);
            throw error;
        }
    }, []);
    const updateItemCount = useCallback(async (itemId, countedQuantity, notes) => {
        try {
            const { error } = await supabase
                .from('stocktake_items')
                .update({
                counted_quantity: countedQuantity,
                notes,
                counted_at: new Date().toISOString()
            })
                .eq('id', itemId);
            if (error)
                throw error;
        }
        catch (error) {
            console.error('Error updating item count:', error);
            throw error;
        }
    }, []);
    const completeStocktake = useCallback(async (stocktakeId, applyAdjustments) => {
        try {
            if (applyAdjustments) {
                
                const { data: items, error: itemsError } = await supabase
                    .from('stocktake_items')
                    .select('product_id, counted_quantity, variance')
                    .eq('stocktake_id', stocktakeId)
                    .not('counted_quantity', 'is', null);
                if (itemsError)
                    throw itemsError;
                
                for (const item of items || []) {
                    if (item.variance !== 0 && item.counted_quantity !== null) {
                        
                        await supabase
                            .from('products')
                            .update({ stock: item.counted_quantity })
                            .eq('id', item.product_id);
                        
                        await supabase
                            .from('stock_movements')
                            .insert({
                            product_id: item.product_id,
                            movement_type: 'adjustment',
                            quantity: item.variance || 0,
                            reference_number: stocktakeId,
                            notes: 'Stocktake adjustment'
                        });
                    }
                }
            }
            
            const { error } = await supabase
                .from('stocktakes')
                .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
                .eq('id', stocktakeId);
            if (error)
                throw error;
        }
        catch (error) {
            console.error('Error completing stocktake:', error);
            throw error;
        }
    }, []);
    const cancelStocktake = useCallback(async (stocktakeId) => {
        try {
            const { error } = await supabase
                .from('stocktakes')
                .update({ status: 'cancelled' })
                .eq('id', stocktakeId);
            if (error)
                throw error;
        }
        catch (error) {
            console.error('Error cancelling stocktake:', error);
            throw error;
        }
    }, []);
    return {
        stocktakes,
        currentStocktake,
        stocktakeItems,
        loading,
        setCurrentStocktake,
        fetchStocktakes,
        fetchStocktakeItems,
        createStocktake,
        initializeStocktakeItems,
        updateItemCount,
        completeStocktake,
        cancelStocktake
    };
}
