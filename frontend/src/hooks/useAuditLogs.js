import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
export function useAuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const fetchLogs = useCallback(async (filters = {}, page = 1, pageSize = 50) => {
        setLoading(true);
        try {
            let query = supabase
                .from('audit_logs')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1);
            if (filters.table_name) {
                query = query.eq('table_name', filters.table_name);
            }
            if (filters.action) {
                query = query.eq('action', filters.action);
            }
            if (filters.user_id) {
                query = query.eq('user_id', filters.user_id);
            }
            if (filters.date_from) {
                query = query.gte('created_at', filters.date_from);
            }
            if (filters.date_to) {
                query = query.lte('created_at', filters.date_to);
            }
            const { data: logsData, error, count } = await query;
            if (error)
                throw error;
            
            const userIds = [...new Set((logsData || []).map(l => l.user_id).filter(Boolean))];
            let profiles = {};
            if (userIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, email, full_name')
                    .in('id', userIds);
                profiles = (profilesData || []).reduce((acc, p) => {
                    acc[p.id] = { email: p.email, full_name: p.full_name };
                    return acc;
                }, {});
            }
            
            const enrichedLogs = (logsData || []).map(log => ({
                ...log,
                user_email: log.user_id ? profiles[log.user_id]?.email : null,
                user_name: log.user_id ? profiles[log.user_id]?.full_name : null
            }));
            setLogs(enrichedLogs);
            setTotalCount(count || 0);
        }
        catch (error) {
            console.error('Error fetching audit logs:', error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const getTableNames = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('table_name')
                .limit(100);
            if (error)
                throw error;
            const uniqueTables = [...new Set(data?.map(d => d.table_name) || [])];
            return uniqueTables.sort();
        }
        catch (error) {
            console.error('Error fetching table names:', error);
            return [];
        }
    }, []);
    return {
        logs,
        loading,
        totalCount,
        fetchLogs,
        getTableNames
    };
}
