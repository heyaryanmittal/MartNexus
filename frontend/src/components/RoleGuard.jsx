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
    
    VIEW_DASHBOARD: ['admin', 'manager', 'cashier'],
    
    USE_POS: ['admin', 'manager', 'cashier'],
    APPLY_DISCOUNTS: ['admin', 'manager'],
    
    VIEW_PRODUCTS: ['admin', 'manager', 'cashier'],
    MANAGE_PRODUCTS: ['admin', 'manager'],
    
    VIEW_INVENTORY: ['admin', 'manager', 'cashier'],
    MANAGE_INVENTORY: ['admin', 'manager'],
    
    VIEW_SALES: ['admin', 'manager'],
    VIEW_OWN_SALES: ['admin', 'manager', 'cashier'],
    
    VIEW_REPORTS: ['admin', 'manager'],
    VIEW_FINANCIAL_REPORTS: ['admin'],
    
    VIEW_SUPPLIERS: ['admin', 'manager'],
    MANAGE_SUPPLIERS: ['admin', 'manager'],
    
    VIEW_CUSTOMERS: ['admin', 'manager', 'cashier'],
    MANAGE_CUSTOMERS: ['admin', 'manager'],
    
    MANAGE_USERS: ['admin'],
    
    MANAGE_SETTINGS: ['admin'],
};
