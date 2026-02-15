import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    branches: [],
    currentBranchId: null,
    loading: false,
};
const branchSlice = createSlice({
    name: 'branch',
    initialState,
    reducers: {
        setBranches: (state, action) => {
            state.branches = action.payload;
        },
        setCurrentBranch: (state, action) => {
            state.currentBranchId = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});
export const { setBranches, setCurrentBranch, setLoading } = branchSlice.actions;
export default branchSlice.reducer;
