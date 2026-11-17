import axiosInstance from './axiosInstance';

export const getFuelReadings = (jobCardId) =>
    axiosInstance.get(`fuel-reading/${jobCardId}`);

export const saveInReading = (jobCardId,data) => {
    return axiosInstance.post(`fuel-reading/${jobCardId}/in`, data);
}