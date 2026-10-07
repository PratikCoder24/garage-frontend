import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as jobCardApi from "../../api/jobCardApi.js";

export const fetchJobCards = createAsyncThunk(
    "/jobcards/fetchJobCards",
    async (_, thunkAPI) => {
        try {
            const response = await jobCardApi.getAllJobCards();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to fetch job cards!"
            );
        }
    }
);

export const fetchJobCardById = createAsyncThunk(
    "/jobcards/fetchJobCardById",
    async (id, thunkAPI) => {
        try {
            const response = await jobCardApi.getJobCardById(id);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to fetch job card!"
            );
        }
    }
);

export const createJobCard = createAsyncThunk(
    "/jobcards/createJobCard",
    async (data, thunkAPI) => {
        try {
            const response = await jobCardApi.createJobCard(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to create job card!"
            );
        }
    }
);

export const updateJobCard = createAsyncThunk(
    "/jobcards/updateJobCard",
    async ({ id, data }, thunkAPI) => {
        try {
            const response = await jobCardApi.updateJobCard(id, data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to update job card!"
            );
        }
    }
);

export const updateJobCardStatus = createAsyncThunk(
    "/jobcards/updateJobCardStatus",
    async ({ id, status }, thunkAPI) => {
        try {
            const response = await jobCardApi.updateJobCardStatus(
                id,
                status
            );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to update job card status!"
            );
        }
    }
);

export const addServiceToJobCard = createAsyncThunk(
    "/jobcards/addServiceToJobCard",
    async ({ jobCardId, data }, thunkAPI) => {
        try {
            const response =
                await jobCardApi.addServiceToJobCard(
                    jobCardId,
                    data
                );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to add service to job card!"
            );
        }
    }
);

export const getServicesForJobCard = createAsyncThunk(
    "/jobcards/getServicesForJobCard",
    async (jobCardId, thunkAPI) => {
        try {
            const response =
                await jobCardApi.getServicesForJobCard(
                    jobCardId
                );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to fetch services for job card!"
            );
        }
    }
);

export const updateLabourFee = createAsyncThunk(
    "/jobcards/updateLabourfee",
    async ({ itemId, labourFee }, thunkAPI) => {
        try {
            const response =
                await jobCardApi.updateLabourFee(
                    itemId,
                    labourFee
                );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to update labour fee!"
            );
        }
    }
);

export const removeService = createAsyncThunk(
    "/jobcards/removeService",
    async (itemId, thunkAPI) => {
        try {
            await jobCardApi.removeService(itemId);
            return itemId;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to remove service!"
            );
        }
    }
);

export const estimateCost = createAsyncThunk(
    "/jobcards/estimateCost",
    async (jobCardId, thunkAPI) => {
        try {
            const response =
                await jobCardApi.estimateCost(jobCardId);

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to estimate cost!"
            );
        }
    }
);

export const addPartToJobCard = createAsyncThunk(
    "/jobcards/addPartToJobCard",
    async ({ jobCardId, data }, thunkAPI) => {
        try {
            const response =
                await jobCardApi.addPartToJobCard(
                    jobCardId,
                    data
                );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to add part to job card!"
            );
        }
    }
);

export const getPartsForJobCard = createAsyncThunk(
    "/jobcards/getPartsForJobCard",
    async (jobCardId, thunkAPI) => {
        try {
            const response =
                await jobCardApi.getPartsForJobCard(
                    jobCardId
                );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to fetch parts for job card!"
            );
        }
    }
);

export const updatePriceUsed = createAsyncThunk(
    "/jobcards/updatePriceUsed",
    async ({ itemId, priceUsed }, thunkAPI) => {
        try {
            const response =
                await jobCardApi.updatePriceUsed(
                    itemId,
                    priceUsed
                );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to update price used!"
            );
        }
    }
);

export const removePart = createAsyncThunk(
    "/jobcards/removePart",
    async (itemId, thunkAPI) => {
        try {
            await jobCardApi.removePart(itemId);
            return itemId;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to remove part!"
            );
        }
    }
);

export const getPartsTotal = createAsyncThunk(
    "/jobcards/getPartsTotal",
    async (jobCardId, thunkAPI) => {
        try {
            const response =
                await jobCardApi.getPartsTotal(jobCardId);

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                    "Failed to get parts total!"
            );
        }
    }
);

const initialState = {
    jobCards: [],
    isLoading: false,
    isSaving: false,
    isStatusUpdating: false,
    statusUpdatingId: null,
    isLoadingSelectedJobCard: false,
    error: null,
    selectedJobCard: null,
    services: [],
    parts: [],
};

export const jobCardSlice = createSlice({
    name: "jobcards",

    initialState,

    reducers: {
        clearError: (state) => {
            state.error = null;
        },

        clearSelectedJobCard: (state) => {
            state.selectedJobCard = null;
        },
    },

    extraReducers: (builder) => {
        builder

            .addCase(fetchJobCards.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            .addCase(fetchJobCards.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobCards = action.payload || [];
            })

            .addCase(fetchJobCards.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(fetchJobCardById.pending, (state) => {
                state.isLoadingSelectedJobCard = true;
                state.error = null;
            })

            .addCase(
                fetchJobCardById.fulfilled,
                (state, action) => {
                    state.isLoadingSelectedJobCard = false;
                    state.selectedJobCard = action.payload;
                    state.error = null;
                }
            )

            .addCase(
                fetchJobCardById.rejected,
                (state, action) => {
                    state.isLoadingSelectedJobCard = false;
                    state.selectedJobCard = null;
                    state.error = action.payload;
                }
            )

            .addCase(createJobCard.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })

            .addCase(createJobCard.fulfilled, (state, action) => {
                state.isSaving = false;

                if (action.payload) {
                    state.jobCards.push(action.payload);
                }

                state.error = null;
            })

            .addCase(createJobCard.rejected, (state, action) => {
                state.isSaving = false;
                state.error = action.payload;
            })

            .addCase(updateJobCard.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })

            .addCase(updateJobCard.fulfilled, (state, action) => {
                state.isSaving = false;

                const index = state.jobCards.findIndex(
                    (jobCard) =>
                        jobCard.id === action.payload?.id
                );

                if (index !== -1) {
                    state.jobCards[index] = action.payload;
                }

                state.selectedJobCard = action.payload;
                state.error = null;
            })

            .addCase(updateJobCard.rejected, (state, action) => {
                state.isSaving = false;
                state.error = action.payload;
            })

            .addCase(
                updateJobCardStatus.pending,
                (state, action) => {
                    state.isStatusUpdating = true;
                    state.statusUpdatingId =
                        action.meta.arg.id;
                    state.error = null;
                }
            )

            .addCase(
                updateJobCardStatus.fulfilled,
                (state, action) => {
                    state.isStatusUpdating = false;
                    state.statusUpdatingId = null;

                    const index = state.jobCards.findIndex(
                        (jobCard) =>
                            jobCard.id === action.payload?.id
                    );

                    if (index !== -1) {
                        state.jobCards[index] = {
                            ...state.jobCards[index],
                            ...action.payload,
                        };
                    }

                    if (
                        state.selectedJobCard &&
                        state.selectedJobCard.id ===
                            action.payload?.id
                    ) {
                        state.selectedJobCard = {
                            ...state.selectedJobCard,
                            ...action.payload,
                        };
                    }

                    state.error = null;
                }
            )

            .addCase(
                updateJobCardStatus.rejected,
                (state, action) => {
                    state.isStatusUpdating = false;
                    state.statusUpdatingId = null;
                    state.error = action.payload;
                }
            )

            .addCase(
                addServiceToJobCard.fulfilled,
                (state, action) => {
                    state.services.push(action.payload);
                    state.error = null;
                }
            )

            .addCase(
                addServiceToJobCard.rejected,
                (state, action) => {
                    state.error = action.payload;
                }
            )

            .addCase(
                getServicesForJobCard.fulfilled,
                (state, action) => {
                    state.services = action.payload || [];
                    state.error = null;
                }
            )

            .addCase(
                getServicesForJobCard.rejected,
                (state, action) => {
                    state.error = action.payload;
                }
            )

            .addCase(
                updateLabourFee.fulfilled,
                (state, action) => {
                    const index = state.services.findIndex(
                        (service) =>
                            service.id === action.payload?.id
                    );

                    if (index !== -1) {
                        state.services[index] =
                            action.payload;
                    }

                    state.error = null;
                }
            )

            .addCase(
                updateLabourFee.rejected,
                (state, action) => {
                    state.error = action.payload;
                }
            )

            .addCase(removeService.fulfilled, (state, action) => {
                state.services = state.services.filter(
                    (service) =>
                        service.id !== action.payload
                );

                state.error = null;
            })

            .addCase(removeService.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(
                getPartsForJobCard.fulfilled,
                (state, action) => {
                    state.parts = action.payload || [];
                    state.error = null;
                }
            )

            .addCase(
                getPartsForJobCard.rejected,
                (state, action) => {
                    state.error = action.payload;
                }
            )

            .addCase(
                addPartToJobCard.fulfilled,
                (state, action) => {
                    state.parts.push(action.payload);
                    state.error = null;
                }
            )

            .addCase(
                addPartToJobCard.rejected,
                (state, action) => {
                    state.error = action.payload;
                }
            )

            .addCase(
                updatePriceUsed.fulfilled,
                (state, action) => {
                    const index = state.parts.findIndex(
                        (part) =>
                            part.id === action.payload?.id
                    );

                    if (index !== -1) {
                        state.parts[index] =
                            action.payload;
                    }

                    state.error = null;
                }
            )

            .addCase(
                updatePriceUsed.rejected,
                (state, action) => {
                    state.error = action.payload;
                }
            )

            .addCase(removePart.fulfilled, (state, action) => {
                state.parts = state.parts.filter(
                    (part) => part.id !== action.payload
                );

                state.error = null;
            })

            .addCase(removePart.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(
                getPartsTotal.fulfilled,
                (state, action) => {
                    if (state.selectedJobCard) {
                        state.selectedJobCard.partsTotal =
                            action.payload;
                    }

                    state.error = null;
                }
            )

            .addCase(
                getPartsTotal.rejected,
                (state, action) => {
                    state.error = action.payload;
                }
            )

            .addCase(
                estimateCost.fulfilled,
                (state, action) => {
                    if (state.selectedJobCard) {
                        state.selectedJobCard.estimate =
                            action.payload;
                    }

                    state.error = null;
                }
            )

            .addCase(
                estimateCost.rejected,
                (state, action) => {
                    state.error = action.payload;
                }
            );
    },
});

export const {
    clearError,
    clearSelectedJobCard,
} = jobCardSlice.actions;

export default jobCardSlice.reducer;