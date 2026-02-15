import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function useShop() {
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchShop = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/shops');
            if (data && data.length > 0) {
                setShop(data[0]);
            } else {
                setShop(null);
            }
        } catch (err) {
            console.error('Error fetching shop details:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShop();
    }, []);

    return { shop, loading, error, fetchShop };
}
