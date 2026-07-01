import axiosInstance from './axiosInstance';

// Core job card
export const getAllJobCards = () =>
    axiosInstance.get('/job-card/all');

export const getJobCardById = (id) =>
    axiosInstance.get(`/job-card/${id}`);

export const createJobCard = (data) =>
    axiosInstance.post('/job-card/create', data);

export const updateJobCard = (id, data) =>
    axiosInstance.put(`/job-card/update/${id}`, data);

export const updateJobCardStatus = (id, status) =>
    axiosInstance.patch(`/job-card/status/${id}`, { status });

// Services on job card
export const addServiceToJobCard = (jobCardId, data) =>
    axiosInstance.post(`/job-card/${jobCardId}/services`, data);

export const getServicesForJobCard = (jobCardId) =>
    axiosInstance.get(`/job-card/${jobCardId}/services`);

export const updateLabourFee = (itemId, labourFee) =>
    axiosInstance.patch(`/job-card/services/${itemId}`, { labourFee });

export const removeService = (itemId) =>
    axiosInstance.delete(`/job-card/services/${itemId}`);

export const getEstimate = (jobCardId) =>
    axiosInstance.get(`/job-card/${jobCardId}/estimate`);

// Parts on job card
export const addPartToJobCard = (jobCardId, data) =>
    axiosInstance.post(`/job-card/${jobCardId}/parts`, data);

export const getPartsForJobCard = (jobCardId) =>
    axiosInstance.get(`/job-card/${jobCardId}/parts`);

export const updatePriceUsed = (itemId, priceUsed) =>
    axiosInstance.patch(`/job-card/parts/${itemId}`, { priceUsed });

export const removePart = (itemId) =>
    axiosInstance.delete(`/job-card/parts/${itemId}`);

export const getPartsTotal = (jobCardId) =>
    axiosInstance.get(`/job-card/${jobCardId}/parts-total`);