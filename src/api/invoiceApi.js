import axiosInstance from './axiosInstance';

export const generateInvoice = (jobCardId) =>
    axiosInstance.post(`invoices/job-card/${jobCardId}`);

export const getInvoice = (invoiceId) =>
    axiosInstance.get(`invoices/${invoiceId}`);

export const getInvoiceByJobCardId = (jobCardId) =>
    axiosInstance.get(`invoices/job-card/${jobCardId}`);