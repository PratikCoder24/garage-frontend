import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as customerApi from "../../api/customerApi";

export const fetchAllCustomers = createAsyncThunk("/customer/fetchAll", async (_, thunkAPI) => {
    try {
        const response = await customerApi.getAllCustomer();
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch customers!");
    }
});

export const addCustomer = createAsyncThunk("/customer/addCustomer", async (data, thunkAPI) => {
    try {
        const response = await customerApi.addCustomer(data);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to add customer!");
    }
});

export const updateCustomer = createAsyncThunk("/customer/updateCustomer", async ({ id, data }, thunkAPI) => {
    try {
        const response = await customerApi.updateCustomer(id, data);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update customer!");
    }
});

export const deleteCustomer = createAsyncThunk("/customer/deleteCustomer", async (id, thunkAPI) => {
    try {
        await customerApi.deleteCustomer(id);
        return id; // return the id — payload is no longer a customer object
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete customer!");
    }
});

const initialState = {
    customers: [],
    isLoading: false,
    error: null,
};

const customerSlice = createSlice({
    name: "customers",
    initialState,
    reducers: {
        clearError: (state) => { state.error = null; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllCustomers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllCustomers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.customers = action.payload;
            })
            .addCase(fetchAllCustomers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(addCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.customers.push(action.payload);
            })
            .addCase(addCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(updateCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.customers.findIndex(c => c.id === action.payload.id);
                if (index !== -1) state.customers[index] = action.payload;
            })
            .addCase(updateCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(deleteCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.customers = state.customers.filter(c => c.id !== action.payload);
            })
            .addCase(deleteCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = customerSlice.actions;
export default customerSlice.reducer;