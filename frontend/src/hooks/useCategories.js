import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAppSelector } from '@/store/hooks';

export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const { activeShop } = useAppSelector((state) => state.shops);

    const fetchCategories = useCallback(async () => {
        if (!activeShop) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/categories?shopId=${activeShop.id}`);
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    }, [activeShop]);

    const createCategory = async (categoryData) => {
        if (!activeShop) throw new Error("No active shop selected");
        try {
            await api.post('/categories', { ...categoryData, shopId: activeShop.id });
            fetchCategories();
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    };

    const updateCategory = async (id, categoryData) => {
        try {
            await api.put(`/categories/${id}`, categoryData);
            fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    };

    const deleteCategory = async (id) => {
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    };

    return {
        categories,
        loading,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    };
}
