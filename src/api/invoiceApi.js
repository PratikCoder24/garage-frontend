import axiosInstance from './axiosInstance';

export const generateInvoice = (jobCardId) =>
    axiosInstance.post(`/job-card/${jobCardId}`);

export const getInvoice = (invoiceId) =>
    axiosInstance.get(`/${invoiceId}`);