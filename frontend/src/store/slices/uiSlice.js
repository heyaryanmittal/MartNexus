import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    sidebarCollapsed: false,
    theme: 'light',
    loading: {},
};
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setSidebarCollapsed: (state, action) => {
            state.sidebarCollapsed = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        setLoading: (state, action) => {
            state.loading[action.payload.key] = action.payload.value;
        },
    },
});
export const { toggleSidebar, setSidebarCollapsed, setTheme, setLoading } = uiSlice.actions;
export default uiSlice.reducer;
