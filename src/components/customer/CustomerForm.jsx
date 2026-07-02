import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { addCustomer } from "../../features/customer/CustomerReducer";
import { successToast, errorToast, warningToast } from "../../toast/Toast";
import { checkPhone } from "../../api/customerApi";

const CustomerForm = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.customers);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [phoneWarning, setPhoneWarning] = useState(null);

    const handlePhoneBlur = async () => {
        if (customerPhone.length === 10) {
            try {
                const response = await checkPhone(customerPhone);
                if (response.data === true) {
                    warningToast("A customer with this number already exists — double check before saving.");
                    setPhoneWarning("A customer with this number already exists.");
                } else {
                    setPhoneWarning(null);
                }
            } catch {
                setPhoneWarning(null);
            }
        }
    };

    const handleClose = () => {
        setCustomerName("");
        setCustomerPhone("");
        setCustomerAddress("");
        setPhoneWarning(null);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
            errorToast("Please fill in all fields");
            return;
        }
        try {
            await dispatch(addCustomer({
                name: customerName.trim(),
                phone: customerPhone.trim(),
                address: customerAddress.trim(),
            })).unwrap();
            successToast("Customer added successfully!");
            handleClose();
        } catch (error) {
            errorToast(error || "Something went wrong!");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Add New Customer</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Enter customer details below</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            onBlur={handlePhoneBlur}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            className={`border rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                                phoneWarning
                                    ? "border-yellow-400 focus:ring-yellow-400"
                                    : "border-gray-200 focus:ring-blue-500"
                            }`}
                        />
                        {phoneWarning && (
                            <p className="text-xs text-yellow-600 flex items-center gap-1">
                                ⚠️ {phoneWarning}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="Street, City"
                            rows={3}
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-1 pb-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg text-sm font-medium transition"
                        >
                            {isLoading ? "Saving..." : "Add Customer"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CustomerForm;