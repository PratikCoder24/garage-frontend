import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/customer/CustomerReducer";
import vehicleReducer from "../features/vehicle/VehicleReducer";
import partsReducer from "../features/parts/PartsReducer";
import serviceReducer from "../features/servicess/ServiceReducer";
import jobCardReducer from "../features/jobcard/JobCardSlice";
import invoiceReducer from "../features/invoice/InvoiceReducer";

export const store = configureStore({
    reducer : {
         customers : customerReducer,
         vehicles : vehicleReducer,
         parts : partsReducer,
         services : serviceReducer,
         jobcards : jobCardReducer,
         invoice : invoiceReducer
    }
});