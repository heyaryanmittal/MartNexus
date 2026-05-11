import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';

export const useRoles = () => {
    const user = useAppSelector((state) => state.auth.user);
    const isLoading = useAppSelector((state) => state.auth.loading);

    const roles = useMemo(() => {
        if (!user) return [];
        // Support both single role on user object and multiple roles if the backend sends them
        const userRoles = user.roles || (user.role ? [user.role.toLowerCase()] : []);
        return userRoles;
    }, [user]);

    return {
        roles,
        isAdmin: roles.includes('admin') || roles.includes('user'),
        isManager: roles.includes('manager') || roles.includes('admin') || roles.includes('user'),
        isCashier: roles.includes('cashier') || roles.includes('manager') || roles.includes('admin') || roles.includes('user'),
        hasRole: (role) => roles.includes(role.toLowerCase()),
        hasAnyRole: (checkRoles) => checkRoles.some((role) => roles.includes(role.toLowerCase())),
        isLoading,
        refetch: () => {}, // Handled by App.jsx auth check
    };
};

export const useUserManagement = () => {
    const queryClient = useQueryClient();

    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data } = await api.get('/auth/manage-users');
            return data || [];
        }
    });

    const assignRole = useCallback(async (userId, role) => {
        try {
            await api.post(`/auth/manage-users/${userId}/roles`, { role });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to assign role' };
        }
    }, [queryClient]);

    const removeRole = useCallback(async (userId, role) => {
        try {
            await api.delete(`/auth/manage-users/${userId}/roles/${role}`);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to remove role' };
        }
    }, [queryClient]);

    return {
        users,
        isLoading,
        fetchUsers: refetch,
        assignRole,
        removeRole,
    };
};
