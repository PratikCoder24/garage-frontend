import { axiosInstance } from "./axiosInstance";

export const getAllCustomer = () => 
    axiosInstance.get(`/customer/all`);

export const addCustomer = (data) =>
    axiosInstance.post(`/customer/add`,data);

export const updateCustomer = (id,data) =>
    axiosInstance.post(`/customer/update/${id}`,data);

export const deleteCustomer = (id) =>
    axiosInstance.delete(`/customer/delete/${id}`);

export const checkPhone = (phone) =>
    axiosInstance.get(`/customer/phone?phone=${phone}`);