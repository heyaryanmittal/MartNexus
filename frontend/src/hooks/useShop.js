import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useShop() {
    const { data: shops = [], isLoading: loading, error, refetch } = useQuery({
        queryKey: ['shops'],
        queryFn: async () => {
            const { data } = await api.get('/shops');
            return data || [];
        },
    });

    const shop = shops.length > 0 ? shops[0] : null;

    return { shop, shops, loading, error, fetchShop: refetch };
}
