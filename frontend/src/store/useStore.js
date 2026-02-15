import { useAppSelector } from './hooks';


export const useStore = () => {
    const auth = useAppSelector((state) => state.auth);
    const shops = useAppSelector((state) => state.shops);
    const products = useAppSelector((state) => state.products);
    const inventory = useAppSelector((state) => state.inventory);
    const ui = useAppSelector((state) => state.ui);

    return {
        
        user: auth?.user,
        isAuthenticated: auth?.isAuthenticated,
        loading: auth?.loading,

        
        shops: shops?.shops || [],
        activeShop: shops?.activeShop,
        shopLoading: shops?.loading,
        shopError: shops?.error,

        
        inventory: inventory?.items || [],

        
        products: products?.items || [],

        
        sidebarOpen: ui?.sidebarOpen,
    };
};
