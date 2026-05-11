import { useRoles } from '@/hooks/useRoles';
export const RoleGuard = ({ children, allowedRoles, fallback = null }) => {
    const { hasAnyRole, isLoading } = useRoles();
    if (isLoading) {
        return null;
    }
    if (!hasAnyRole(allowedRoles)) {
        return <>{fallback}</>;
    }
    return <>{children}</>;
};

export const PERMISSIONS = {
    
    VIEW_DASHBOARD: ['admin', 'manager', 'cashier', 'user'],
    
    USE_POS: ['admin', 'manager', 'cashier', 'user'],
    APPLY_DISCOUNTS: ['admin', 'manager', 'user'],
    
    VIEW_PRODUCTS: ['admin', 'manager', 'cashier', 'user'],
    MANAGE_PRODUCTS: ['admin', 'manager', 'user'],
    
    VIEW_INVENTORY: ['admin', 'manager', 'cashier', 'user'],
    MANAGE_INVENTORY: ['admin', 'manager', 'user'],
    
    VIEW_SALES: ['admin', 'manager', 'user'],
    VIEW_OWN_SALES: ['admin', 'manager', 'cashier', 'user'],
    
    VIEW_REPORTS: ['admin', 'manager', 'user'],
    VIEW_FINANCIAL_REPORTS: ['admin', 'user'],
    
    VIEW_SUPPLIERS: ['admin', 'manager', 'user'],
    MANAGE_SUPPLIERS: ['admin', 'manager', 'user'],
    
    VIEW_CUSTOMERS: ['admin', 'manager', 'cashier', 'user'],
    MANAGE_CUSTOMERS: ['admin', 'manager', 'user'],
    
    MANAGE_USERS: ['admin', 'user'],
    
    MANAGE_SETTINGS: ['admin', 'user'],
};
