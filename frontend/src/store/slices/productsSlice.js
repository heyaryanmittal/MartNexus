import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    products: [],
    selectedProduct: null,
    loading: false,
    filters: {
        search: '',
        category: '',
    },
};
const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
    },
});
export const { setProducts, setSelectedProduct, setLoading, setFilters } = productsSlice.actions;
export default productsSlice.reducer;
