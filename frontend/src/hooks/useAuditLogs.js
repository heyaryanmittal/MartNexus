import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useAuditLogs(filters = {}, page = 1, pageSize = 50) {
    const query = useQuery({
        queryKey: ['audit-logs', filters, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get('/auth/audit-logs', {
                params: {
                    ...filters,
                    page,
                    pageSize
                }
            });
            return data || { logs: [], totalCount: 0 };
        }
    });

    const getTableNames = async () => {
        const { data } = await api.get('/auth/audit-logs-tables');
        return data || [];
    };

    return {
        logs: query.data?.logs || [],
        totalCount: query.data?.totalCount || 0,
        loading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        getTableNames
    };
}
