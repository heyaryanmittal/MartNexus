import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import api from '@/lib/api';

export function useDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { activeShop } = useStore();

    const refreshData = useCallback(async () => {
        if (!activeShop?.id) return;

        setLoading(true);
        try {
            const { data: result } = await api.get('/dashboard/stats', {
                params: { shopId: activeShop.id }
            });

            if (result.success) {
                setData(result.data);
            } else {
                console.error('Failed to fetch dashboard data:', result.message);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [activeShop?.id]);

    return { data, loading, refreshData };
}

