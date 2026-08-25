import {createSlice , createAsyncThunk} from '@reduxjs/toolkit';
import * as catalogue from '../../api/parts.js';

export const fetchAllParts = createAsyncThunk("/parts/fetchAll", async(_,thunkAPI) => {
    try{
        const response = await catalogue.getAllParts();
        return response.data;
    }catch(error){
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch parts!");
    }
})

export const addPart = createAsyncThunk("/parts/addParts", async(data,thunkAPI) => {
    try{
        const response = await catalogue.addPart(data);
        return response.data;
    }catch(error){
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to add part!");
    }
})

export const updatePart = createAsyncThunk("/parts/updateParts", async({id,data}, thunkAPI) =>{
    try{
        const response = await catalogue.updatePart(id,data);
        return response.data;
    }catch(error){
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update part!");
    }
})

export const deletePart = createAsyncThunk("/parts/deleteParts", async(id, thunkAPI) => {
    try{
        const response = await catalogue.deletePart(id);
        return id;
    }catch(error){
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete part!");     
     }
 })


const initialState = {
    parts : [],
    isLoading : false,
    error : null
}

export const partsSlice = createSlice({
    name : "parts",
    initialState,
    reducers : {
        clearError : (state) => {state.error = null}
    },
    extraReducers : (builder) => {
        builder
        .addCase(fetchAllParts.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchAllParts.fulfilled, (state, action) => {
            state.isLoading = false;    
            state.parts = action.payload;
            state.error = null;
        })
        .addCase(fetchAllParts.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(addPart.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(addPart.fulfilled, (state, action) => {
            state.isLoading = false;
            state.parts.push(action.payload);
            state.error = null;
        })
        .addCase(addPart.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(updatePart.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(updatePart.fulfilled, (state, action) => {
            state.isLoading = false;
            const index = state.parts.findIndex(part => part.id === action.payload.id);
            if (index !== -1) {
                state.parts[index] = action.payload;
            }
            state.error = null;
        })
        .addCase(updatePart.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(deletePart.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(deletePart.fulfilled, (state, action) => {
            state.isLoading = false;
            state.parts = state.parts.filter(part => part.id !== action.payload);
            state.error = null;
        })
        .addCase(deletePart.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
    }
})
export const {clearError} = partsSlice.actions;
export default partsSlice.reducer;
