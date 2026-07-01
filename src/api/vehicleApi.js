import axiosInstance from './axiosInstance';

export const getAllVehicles = () =>
    axiosInstance.get('/vehicles/all');

export const addVehicle = (data) =>
    axiosInstance.post('/vehicles/add', data);

export const updateVehicle = (id, data) =>
    axiosInstance.put(`/vehicles/update/${id}`, data);

export const deleteVehicle = (id) =>
    axiosInstance.delete(`/vehicles/delete/${id}`);

export const searchVehicle = (vehicleNumber) =>
    axiosInstance.get(`/vehicles/search?vehicleNumber=${vehicleNumber}`);