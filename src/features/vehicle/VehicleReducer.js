import {createSlice ,createAsyncThunk} from "@reduxjs/toolkit";
import * as vehicleApi from "../../api/vehicleApi";

export const fetchAllVehicles = createAsyncThunk("/vehicles/fetchAllVehicles", async(_,thunkAPI) => {
    try{
        const response = await vehicleApi.getAllVehicles();
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch vehicles!");
    }
})

export const addVehicle = createAsyncThunk("/vehicles/addVehicle", async(data, thunkAPI) => {
     try {
        const response = await vehicleApi.addVehicle(data);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to add vehicle!");
    }
})

export const updateVehicle = createAsyncThunk("/vehicles/updateVehicle", async({id,data},thunkAPI) => {
     try {
        const response = await vehicleApi.updateVehicle(id, data);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update vehicle!");
    }
})

export const removeVehicle = createAsyncThunk("/vehicles/removeVehicle", async(id,thunkAPI) => {
     try {
        const response = await vehicleApi.deleteVehicle(id);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete vehicle!");
    }
})

const initialState = {
    vehicles : [],
    isLoading : false,
    error : null
}

const vehicleSlice = createSlice({
    name : "vehicles",
    initialState,
    reducers : {
         clearError: (state) => { state.error = null; }
    },
    extraReducers : (builder) => {
        builder
        .addCase(fetchAllVehicles.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchAllVehicles.fulfilled, (state,action) => {
            state.isLoading = false;
            state.vehicles = action.payload;
            state.error = null;
        })
        .addCase(fetchAllVehicles.rejected, (state,action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(addVehicle.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(addVehicle.fulfilled, (state,action) => {
            state.isLoading = false;
            state.vehicles.push(action.payload);
            state.error = null;
        })
        .addCase(addVehicle.rejected, (state,action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(updateVehicle.pending,(state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(updateVehicle.fulfilled,(state,action) => {
            state.isLoading = false;
            const index = state.vehicles.findIndex(v => v.vehicleId === action.payload.vehicleId);
            if(index != -1) state.vehicles[index] = action.payload; 
            state.error = null;
        })
        .addCase(updateVehicle.rejected,(state,action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(removeVehicle.pending,(state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(removeVehicle.fulfilled,(state,action) => {
            state.isLoading = false;
            state.vehicles = state.vehicles.filter(v => v.vehicleId !== action.payload);
            state.error = null
        })
        .addCase(removeVehicle.rejected,(state,action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

    }
})

export default vehicleSlice.reducer
export const {clearError} = vehicleSlice.actions
    