import { useState } from 'react';
import api from '@/lib/api';
export function useProfile() {
    const [profile, setProfile] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/auth/me');
            setProfile({
                full_name: data.name || data.email.split('@')[0],
                email: data.email,
                id: data.id,
                role: data.role,
                createdAt: data.createdAt
            });
            setRoles([data.role.toLowerCase()]);
        }
        catch (error) {
            console.error('Error fetching profile:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const updateProfile = async (updates) => {
        try {
            const { data } = await api.put('/auth/update-profile', {
                name: updates.full_name,
                email: updates.email
            });
            await fetchProfile();
            return data;
        }
        catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };
    const changePassword = async (currentPassword, newPassword) => {
        try {
            const { data } = await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return data;
        }
        catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    };

    return {
        profile,
        roles,
        loading,
        fetchProfile,
        updateProfile,
        changePassword,
    };
}
