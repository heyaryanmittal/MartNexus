import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import productsReducer from './slices/productsSlice';
import inventoryReducer from './slices/inventorySlice';
import shopReducer from './slices/shopSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        shops: shopReducer,
        ui: uiReducer,
        products: productsReducer,
        inventory: inventoryReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ['auth/setSession'],
            ignoredPaths: ['auth.session'],
        },
    }),
});
