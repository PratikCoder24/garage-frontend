import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/customer/CustomerReducer";
import vehicleReducer from "../features/vehicle/VehicleReducer";

export const store = configureStore({
    reducer : {
         customers : customerReducer,
         vehicles : vehicleReducer,
    }
});