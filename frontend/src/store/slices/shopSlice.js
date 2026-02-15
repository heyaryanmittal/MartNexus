import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const fetchShops = createAsyncThunk('shops/fetchShops', async () => {
    const response = await api.get('/shops');
    return response.data;
});

export const createShop = createAsyncThunk('shops/createShop', async (shopData) => {
    const response = await api.post('/shops', shopData);
    return response.data;
});

export const updateShop = createAsyncThunk('shops/updateShop', async ({ id, data }) => {
    const response = await api.put(`/shops/${id}`, data);
    return response.data;
});

export const deleteShop = createAsyncThunk('shops/deleteShop', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/shops/${id}`);
        return id;
    } catch (error) {
        
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue({ message: error.message });
    }
});

const getPersistedActiveShop = () => {
    try {
        return JSON.parse(localStorage.getItem('activeShop'));
    } catch (e) {
        return null;
    }
};

const initialState = {
    shops: [],
    activeShop: getPersistedActiveShop(),
    loading: false,
    error: null,
};

const shopSlice = createSlice({
    name: 'shops',
    initialState,
    reducers: {
        setActiveShop: (state, action) => {
            state.activeShop = action.payload;
            localStorage.setItem('activeShop', JSON.stringify(action.payload));
        },
        clearShops: (state) => {
            state.shops = [];
            state.activeShop = null;
            localStorage.removeItem('activeShop');
        }
    },
    extraReducers: (builder) => {
        builder
            
            .addCase(fetchShops.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchShops.fulfilled, (state, action) => {
                state.loading = false;
                state.shops = action.payload;

                
                if (state.activeShop) {
                    
                    const exists = action.payload.find(s => s.id === state.activeShop.id);
                    if (exists) {
                        state.activeShop = exists; 
                        localStorage.setItem('activeShop', JSON.stringify(exists));
                    } else {
                        
                        state.activeShop = action.payload.length > 0 ? action.payload[0] : null;
                        if (state.activeShop) localStorage.setItem('activeShop', JSON.stringify(state.activeShop));
                        else localStorage.removeItem('activeShop');
                    }
                } else if (action.payload.length > 0) {
                    
                    state.activeShop = action.payload[0];
                    localStorage.setItem('activeShop', JSON.stringify(state.activeShop));
                }
            })
            .addCase(fetchShops.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            
            .addCase(createShop.fulfilled, (state, action) => {
                state.shops.push(action.payload);
                state.activeShop = action.payload; 
            })
            
            .addCase(updateShop.fulfilled, (state, action) => {
                const index = state.shops.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.shops[index] = action.payload;
                    if (state.activeShop?.id === action.payload.id) {
                        state.activeShop = action.payload;
                    }
                }
            })
            
            .addCase(deleteShop.fulfilled, (state, action) => {
                state.shops = state.shops.filter(s => s.id !== action.payload);
                if (state.activeShop?.id === action.payload) {
                    state.activeShop = state.shops.length > 0 ? state.shops[0] : null;
                }
            });
    },
});

export const { setActiveShop, clearShops } = shopSlice.actions;
export default shopSlice.reducer;
