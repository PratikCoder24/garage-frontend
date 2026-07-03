import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addVehicle } from "../../features/vehicle/VehicleReducer";
import { fetchAllCustomers } from "../../features/customer/CustomerReducer";
import { errorToast, successToast, warningToast } from "../../toast/Toast";
import  {searchVehicle}  from "../../api/vehicleApi";

const VehicleForm = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.vehicles);
    const { customers } = useSelector((state) => state.customers);
    const [model, setModel] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [chassisNumber, setChassisNumber] = useState("");
    const [engineNumber, setEngineNumber] = useState("");
    const [odometer, setOdometer] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [vehicleNumberWarning, setVehicleNumberWarning] = useState(null);
    const [chassisNumberWarning, setChassisNumberWarning] = useState(null);

    const filteredCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(customerSearch.toLocaleLowerCase()) ||
        c.phone.includes(customerSearch)
    );

    const handleVehicleNumberBlur = async () => {
        if (vehicleNumber.trim().length > 0) {
            try {
                const response = await searchVehicle(vehicleNumber.trim())
                if (response.data) {
                    setVehicleNumberWarning("A vehicle with this number already exists!!")
                } else {
                    setVehicleNumberWarning(null)
                }
            } catch {
                setVehicleNumberWarning(null)
            }
        }
    };

    const handleClose = () => {
        setModel("");
        setCompanyName("");
        setVehicleNumber("");
        setChassisNumber("");
        setEngineNumber("");
        setOdometer("");
        setCustomerId("");
        setCustomerSearch("");
        setVehicleNumberWarning(null);
        setChassisNumberWarning(null);
        onClose();
    }

    const handleCustomerSelect = (customer) => {
        setCustomerId(customer.id);
        setCustomerSearch(customer.name + "-" + customer.phone)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!model || !companyName || !vehicleNumber || !chassisNumber || !engineNumber || !odometer || !customerId) {
            errorToast("Please fill in all fields!!")
            return;
        }

        if (isNaN(Number(odometer)) || Number(odometer) < 0) {
            errorToast("Odometer must  be a valid positive number!")
            return;
        }

        try {
            await dispatch(addVehicle({
                model: model.trim(),
                companyName: companyName.trim(),
                vehicleNumber: vehicleNumber.trim().toUpperCase(),
                chassisNumber: chassisNumber.trim().toUpperCase(),
                engineNumber: engineNumber.trim().toUpperCase(),
                odometer: Number(odometer),
                customerId: Number(customerId),
            })).unwrap();
            successToast("vehicle added successfully!");
            handleClose();
        } catch (error) {
            errorToast(error || "Something went Wrong!!")
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Add Vehicle</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Enter vehicle details below</p>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Select Customer <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                setCustomerId("");
                            }}
                            placeholder="Search by name or phone..."
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        {customerSearch.length > 0 && !customerId && filteredCustomers.length > 0 && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm max-h-40 overflow-y-auto">
                                {filteredCustomers.map((customer) => (
                                    <button
                                        key={customer.id}
                                        type="button"
                                        onClick={() => handleCustomerSelect(customer)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition border-b border-gray-50 last:border-0"
                                    >
                                        <span className="font-medium text-gray-800">{customer.name}</span>
                                        <span className="text-gray-500 ml-2">{customer.phone}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {customerSearch.length > 0 && !customerId && filteredCustomers.length === 0 && (
                            <p className="text-xs text-gray-400 px-1">No customers found</p>
                        )}
                        {customerId && (
                            <p className="text-xs text-green-600 px-1">✓ Customer selected</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">
                                Company <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="e.g. Honda"
                                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">
                                Model <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder="e.g. Activa 6G"
                                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Vehicle Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                            onBlur={handleVehicleNumberBlur}
                            placeholder="e.g. MH13AB1234"
                            className={`border rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${vehicleNumberWarning
                                    ? "border-red-300 focus:ring-red-400"
                                    : "border-gray-200 focus:ring-blue-500"
                                }`}
                        />
                        {vehicleNumberWarning && (
                            <p className="text-xs text-red-500 flex items-center gap-1">⚠️ {vehicleNumberWarning}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Chassis Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={chassisNumber}
                            onChange={(e) => setChassisNumber(e.target.value.toUpperCase())}
                            placeholder="e.g. ME4JC509KP1234567"
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Engine Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={engineNumber}
                            onChange={(e) => setEngineNumber(e.target.value.toUpperCase())}
                            placeholder="e.g. JC50E1234567"
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Odometer (km) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={odometer}
                            onChange={(e) => setOdometer(e.target.value)}
                            placeholder="e.g. 14230"
                            min="0"
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                            {isLoading ? "Saving..." : "Add Vehicle"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default VehicleForm
