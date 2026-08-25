import {createSlice , createAsyncThunk} from "@reduxjs/toolkit";
import * as services from "../../api/services.js";

export const fetchAllServices = createAsyncThunk("/services/fetchAll" , async(_,thunkAPI) => {
    try{
        const response = await services.getAllServices();
        return response.data;
    }catch(error){
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch services!");
    }
})

export const addService = createAsyncThunk("/services/addService" , async(data,thunkAPI) => {
    try{
        const response = await services.addService(data);
        return response.data;
    }catch(error){
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to add service!");
    }
})

export const updateService = createAsyncThunk("/services/updateService", async({id,data}, thunkAPI) => {
    try{
        const response = await services.updateService(id,data);
        return response.data;
    }catch(error){
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update service!");
    }
})

export const deleteService = createAsyncThunk("/services/deleteService", async(id , thunkAPI) => {
    try{
        const response = await services.deleteService(id);
        return id;
    }catch(error){
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete service!");
    }
})

const initialState = {
    services : [],
    isLoading : false,
    error : null
}

export const serviceSlice = createSlice({
    name : "services",
    initialState,
    reducers : {
        clearError : (state) => {state.error = null}
    },
    extraReducers : (builder) => {
        builder
        .addCase(fetchAllServices.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchAllServices.fulfilled, (state, action) => {
            state.isLoading = false;
            state.services = action.payload;
            state.error = null;
        })
        .addCase(fetchAllServices.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(addService.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(addService.fulfilled, (state, action) => {
            state.isLoading = false;
            state.services.push(action.payload);
            state.error = null;
        })
        .addCase(addService.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(updateService.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(updateService.fulfilled, (state, action) => {
            state.isLoading = false;
            const index = state.services.findIndex(service => service.id === action.payload.id);
            if (index !== -1) {
                state.services[index] = action.payload;
            }
            state.error = null;
        })
        .addCase(updateService.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(deleteService.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(deleteService.fulfilled, (state, action) => {
            state.isLoading = false;
            state.services = state.services.filter(service => service.id !== action.payload);
            state.error = null;
        })
        .addCase(deleteService.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
    }
})

export const {clearError} = serviceSlice.actions;
export default serviceSlice.reducer;