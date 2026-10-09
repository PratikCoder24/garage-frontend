import {createSlice , createAsyncThunk} from '@reduxjs/toolkit';
import * as invoiceApi from "../../api/invoiceApi";

export const fetchInvoices = createAsyncThunk("/invoices/fetchInvoices", async(id,thunkAPI) => {
    try {
        const response = await invoiceApi.getInvoice(id);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch Invoice!")
    }
})

export const generateInvoice = createAsyncThunk("/invoices/generateInvoice", async(jobcardId,thunkAPI) => {
    try{
        const response = await invoiceApi.generateInvoice(jobcardId);
        return response.data;
    }catch(error){
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to generate Invoice!")
    }
})

export const fetchInvoiceByJobCardId = createAsyncThunk("/invoices/fetchInvoiceByJobCardId", async(jobcardId,thunkAPI) => {
    try{
        const response = await invoiceApi.getInvoiceByJobCardId(jobcardId);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch Invoice by Job Card ID!")
    }
})

const initialState = {
    invoices : [],
    isLoading : false,
    isGenerating : false,
    error : null
}

export const invoiceSlice = createSlice({
    name : "invoice",
    initialState,
    reducers : {
            clearError: (state) => {state.error = null;},
        },
    extraReducers : (builder) => {
        builder
        .addCase(fetchInvoices.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchInvoices.fulfilled, (state, action) => {
            state.isLoading = false;
            state.invoices = action.payload;
        })
        .addCase(fetchInvoices.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(generateInvoice.pending, (state) => {
            state.isGenerating = true;
            state.error = null;
        })
        .addCase(generateInvoice.fulfilled, (state, action) => {
            state.isGenerating = false;
            state.invoices.push(action.payload);
        })
        .addCase(generateInvoice.rejected, (state, action) => {
            state.isGenerating = false;
            state.error = action.payload;
        })
        .addCase(fetchInvoiceByJobCardId.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchInvoiceByJobCardId.fulfilled, (state, action) => {
            state.isLoading = false;
            state.invoices = action.payload;
        })
        .addCase(fetchInvoiceByJobCardId.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
    }    

})

export const {clearError} = invoiceSlice.actions;
export default invoiceSlice.reducer;