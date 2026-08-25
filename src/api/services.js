import axiosInstance from "./axiosInstance";

//service catalogue

export const getAllServices = () => 
    axiosInstance.get(`/service/all`)

export const addService = (data) => 
    axiosInstance.post(`/service/add`,data)

export const updateService = (id,data) => 
    axiosInstance.put(`/service/update/${id}`,data)

export const deleteService = (id) => 
    axiosInstance.delete(`/service/delete/${id}`)