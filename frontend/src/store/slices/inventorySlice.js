import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    lowStockAlerts: [],
    expiringItems: [],
    loading: false,
};
const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        setLowStockAlerts: (state, action) => {
            state.lowStockAlerts = action.payload;
        },
        setExpiringItems: (state, action) => {
            state.expiringItems = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});
export const { setLowStockAlerts, setExpiringItems, setLoading } = inventorySlice.actions;
export default inventorySlice.reducer;
