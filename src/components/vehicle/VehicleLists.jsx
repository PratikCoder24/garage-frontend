import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVehicles, updateVehicle, removeVehicle } from "../../features/vehicle/VehicleReducer";
import { fetchAllCustomers } from "../../features/customer/CustomerReducer";
import { successToast, errorToast, deleteToast } from "../../toast/Toast";
import VehicleForm from "./VehicleForm";
import * as vehicleApi from "../../api/vehicleApi";

const EditInputs = ({
    editCompany, setEditCompany,
    editModel, setEditModel,
    editVehicleNumber, setEditVehicleNumber,
    editVehicleNumberWarning,
    handleEditVehicleNumberBlur,
    editChassisNumber, setEditChassisNumber,
    editEngineNumber, setEditEngineNumber,
    editOdometer, setEditOdometer,
}) => (
    <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
            <input
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                placeholder="Company"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                value={editModel}
                onChange={(e) => setEditModel(e.target.value)}
                placeholder="Model"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div>
            <input
                value={editVehicleNumber}
                onChange={(e) => setEditVehicleNumber(e.target.value.toUpperCase())}
                onBlur={handleEditVehicleNumberBlur}
                placeholder="Vehicle Number"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                    editVehicleNumberWarning
                        ? "border-red-300 focus:ring-red-400"
                        : "border-gray-200 focus:ring-blue-500"
                }`}
            />
            {editVehicleNumberWarning && (
                <p className="text-xs text-red-500 mt-1">⚠️ {editVehicleNumberWarning}</p>
            )}
        </div>
        <input
            value={editChassisNumber}
            onChange={(e) => setEditChassisNumber(e.target.value.toUpperCase())}
            placeholder="Chassis Number"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
            value={editEngineNumber}
            onChange={(e) => setEditEngineNumber(e.target.value.toUpperCase())}
            placeholder="Engine Number"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
            type="number"
            value={editOdometer}
            onChange={(e) => setEditOdometer(e.target.value)}
            placeholder="Odometer (km)"
            min="0"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

const VehicleLists = () => {
    const dispatch = useDispatch();
    const { vehicles, isLoading, error } = useSelector((state) => state.vehicles);
    const { customers } = useSelector((state) => state.customers);

    const [editingId, setEditingId] = useState(null);
    const [editModel, setEditModel] = useState("");
    const [editCompany, setEditCompany] = useState("");
    const [editVehicleNumber, setEditVehicleNumber] = useState("");
    const [editChassisNumber, setEditChassisNumber] = useState("");
    const [editEngineNumber, setEditEngineNumber] = useState("");
    const [editOdometer, setEditOdometer] = useState("");
    const [editCustomerId, setEditCustomerId] = useState("");
    const [editVehicleNumberWarning, setEditVehicleNumberWarning] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [searchVehicleNumber, setSearchVehicleNumber] = useState("");

    useEffect(() => {
        dispatch(fetchAllVehicles());
        dispatch(fetchAllCustomers());
    }, [dispatch]);

    const filteredVehicles = vehicles.filter((v) =>
        v.vehicleNumber.toLowerCase().includes(searchVehicleNumber.toLowerCase().trim())
    );

    const getCustomerName = (customerId) => {
        const customer = customers.find((c) => c.id === customerId);
        return customer ? customer.name : "Unknown";
    };

    const handleEditClick = (vehicle) => {
        setEditingId(vehicle.vehicleId);
        setEditModel(vehicle.model);
        setEditCompany(vehicle.companyName);
        setEditVehicleNumber(vehicle.vehicleNumber);
        setEditChassisNumber(vehicle.chassisNumber);
        setEditEngineNumber(vehicle.engineNumber);
        setEditOdometer(vehicle.odometer);
        setEditCustomerId(vehicle.customerId);
        setEditVehicleNumberWarning(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditModel("");
        setEditCompany("");
        setEditVehicleNumber("");
        setEditChassisNumber("");
        setEditEngineNumber("");
        setEditOdometer("");
        setEditCustomerId("");
        setEditVehicleNumberWarning(null);
    };

    const handleEditVehicleNumberBlur = async () => {
        if (editVehicleNumber.trim().length === 0) return;
        try {
            const response = await vehicleApi.searchVehicle(editVehicleNumber.trim());
            if (response.data?.vehicleId !== editingId) {
                setEditVehicleNumberWarning("A vehicle with this number already exists.");
            } else {
                setEditVehicleNumberWarning(null);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setEditVehicleNumberWarning(null);
            }
        }
    };

    const handleUpdate = async (id) => {
        if (!editModel.trim() || !editCompany.trim() || !editVehicleNumber.trim() ||
            !editChassisNumber.trim() || !editEngineNumber.trim() || !editOdometer) {
            errorToast("Please fill in all fields");
            return;
        }
        if (editVehicleNumberWarning) {
            handleEditVehicleNumberBlur()
            return;
        }
        try {
            await dispatch(updateVehicle({
                id,
                data: {
                    model: editModel.trim(),
                    companyName: editCompany.trim(),
                    vehicleNumber: editVehicleNumber.trim().toUpperCase(),
                    chassisNumber: editChassisNumber.trim().toUpperCase(),
                    engineNumber: editEngineNumber.trim().toUpperCase(),
                    odometer: Number(editOdometer),
                    customerId: Number(editCustomerId),
                }
            })).unwrap();
            successToast("Vehicle updated successfully!");
            handleCancelEdit();
        } catch (error) {
            errorToast(error || "Failed to update vehicle!");
        }
    };

    const handleDelete = (id) => {
        deleteToast("Are you sure you want to delete this vehicle?", async () => {
            try {
                await dispatch(removeVehicle(id)).unwrap();
                successToast("Vehicle deleted successfully!");
            } catch (error) {
                errorToast(error || "Failed to delete vehicle!");
            }
        });
    };

    if (isLoading && vehicles.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
                <p className="text-sm text-gray-400">Loading vehicles...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
                <p className="text-sm text-red-400">{error}</p>
            </div>
        );
    }

    const editInputProps = {
        editCompany, setEditCompany,
        editModel, setEditModel,
        editVehicleNumber, setEditVehicleNumber,
        editVehicleNumberWarning,
        handleEditVehicleNumberBlur,
        editChassisNumber, setEditChassisNumber,
        editEngineNumber, setEditEngineNumber,
        editOdometer, setEditOdometer,
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            <div className="flex flex-col gap-3 px-4 py-4 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">All Vehicles</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{vehicles.length} total</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        value={searchVehicleNumber}
                        onChange={(e) => setSearchVehicleNumber(e.target.value)}
                        placeholder="Search by vehicle number..."
                        className="flex-1 sm:w-56 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <button
                        onClick={() => setFormOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                    >
                        + Add
                    </button>
                </div>
            </div>

            {filteredVehicles.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-gray-400">
                        {searchVehicleNumber ? "No vehicles found with this number" : "No vehicles yet"}
                    </p>
                </div>
            ) : (
                <>
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Number</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Odometer</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.vehicleId} className="hover:bg-gray-50/50 transition-colors">
                                        {editingId === vehicle.vehicleId ? (
                                            <>
                                                <td className="px-6 py-3" colSpan={4}>
                                                    <EditInputs {...editInputProps} />
                                                </td>
                                                <td className="px-6 py-3 align-top pt-5">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleUpdate(vehicle.vehicleId)}
                                                            disabled={isLoading}
                                                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                        >
                                                            {isLoading ? "Saving..." : "Save"}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 text-gray-800 font-medium">{vehicle.companyName} {vehicle.model}</td>
                                                <td className="px-6 py-4 text-gray-600">{vehicle.vehicleNumber}</td>
                                                <td className="px-6 py-4 text-gray-600">{getCustomerName(vehicle.customerId)}</td>
                                                <td className="px-6 py-4 text-gray-600">{vehicle.odometer} km</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEditClick(vehicle)}
                                                            className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(vehicle.vehicleId)}
                                                            className="border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="sm:hidden divide-y divide-gray-100">
                        {filteredVehicles.map((vehicle) => (
                            <div key={vehicle.vehicleId} className="px-4 py-4">
                                {editingId === vehicle.vehicleId ? (
                                    <div className="flex flex-col gap-3">
                                        <EditInputs {...editInputProps} />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdate(vehicle.vehicleId)}
                                                disabled={isLoading}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg text-sm font-medium transition"
                                            >
                                                {isLoading ? "Saving..." : "Save"}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800">{vehicle.companyName} {vehicle.model}</p>
                                            <p className="text-sm text-gray-500">{vehicle.vehicleNumber}</p>
                                            <p className="text-xs text-gray-400">{getCustomerName(vehicle.customerId)}</p>
                                            <p className="text-xs text-gray-400">{vehicle.odometer} km</p>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <button
                                                onClick={() => handleEditClick(vehicle)}
                                                className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vehicle.vehicleId)}
                                                className="border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            <VehicleForm
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
            />
        </div>
    );
};

export default VehicleLists;