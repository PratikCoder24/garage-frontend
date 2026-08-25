
import axiosInstance from "./axiosInstance";

//Parts Catalogue 
export const getAllParts = () => 
    axiosInstance.get(`/parts/all`)

export const addPart = (data) => 
    axiosInstance.post(`/parts/add`,data)

export const updatePart = (id,data) => 
    axiosInstance.put(`/parts/update/${id}`,data)  

export const deletePart = (id) => 
    axiosInstance.delete(`/parts/delete/${id}`)

