import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    user: null,
    session: null,
    loading: true,
    role: null,
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.loading = false;
        },
        setSession: (state, action) => {
            state.session = action.payload;
            state.user = action.payload?.user ?? null;
            state.loading = false;
        },
        setRole: (state, action) => {
            state.role = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.session = null;
            state.role = null;
            state.loading = false;
        },
    },
});
export const { setUser, setSession, setRole, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
