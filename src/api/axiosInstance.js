import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:1001/api/v1",
    headers: {
        'Content-Type': 'application/json',
    }
});

axiosInstance.interceptors.response.use(
    response => response,

    error => {
        const isExpectedInvoice404 =
            error.response?.status === 404 &&
            error.config?.url?.includes("invoices/job-card");

        if (!isExpectedInvoice404) {
            console.error("API error : ", error.response?.data || error.message);
        }

        return Promise.reject(error);
    }

);

export default axiosInstance;