import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCustomers, updateCustomer, deleteCustomer } from "../../features/customer/CustomerReducer";
import { successToast, errorToast, deleteToast } from "../../toast/Toast";
import CustomerForm from "./CustomerForm";

const CustomerList = () => {
    const dispatch = useDispatch();
    const { customers, isLoading, error } = useSelector((state) => state.customers);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [searchPhone, setSearchPhone] = useState("");

    useEffect(() => {
        dispatch(fetchAllCustomers());
    }, [dispatch]);

    const filteredCustomers = customers.filter((customer) =>
        customer.phone.includes(searchPhone.trim())
    );

    const handleEditClick = (customer) => {
        setEditingId(customer.id);
        setEditName(customer.name);
        setEditPhone(customer.phone);
        setEditAddress(customer.address);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setEditPhone("");
        setEditAddress("");
    };

    const handleUpdate = async (id) => {
        if (!editName.trim() || !editPhone.trim() || !editAddress.trim()) {
            errorToast("Please fill in all fields");
            return;
        }
        try {
            await dispatch(updateCustomer({
                id,
                data: {
                    name: editName.trim(),
                    phone: editPhone.trim(),
                    address: editAddress.trim(),
                }
            })).unwrap();
            successToast("Customer updated successfully!");
            handleCancelEdit();
        } catch (error) {
            errorToast(error || "Failed to update customer!");
        }
    };

    const handleDelete = (id) => {
        deleteToast("Are you sure you want to delete this customer?", async () => {
            try {
                await dispatch(deleteCustomer(id)).unwrap();
                successToast("Customer deleted successfully!");
            } catch (error) {
                errorToast(error || "Failed to delete customer!");
            }
        });
    };

    if (isLoading && customers.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
                <p className="text-sm text-gray-400">Loading customers...</p>
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

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            <div className="flex flex-col gap-3 px-4 py-4 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">All Customers</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{customers.length} total</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        placeholder="Search by phone..."
                        maxLength={10}
                        className="flex-1 sm:w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <button
                        onClick={() => setFormOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                    >
                        + Add
                    </button>
                </div>
            </div>

            {filteredCustomers.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-gray-400">
                        {searchPhone ? "No customers found with this phone number" : "No customers yet"}
                    </p>
                    {!searchPhone && (
                        <p className="text-xs text-gray-300">Click "+ Add" to get started</p>
                    )}
                </div>
            ) : (
                <>
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                                        {editingId === customer.id ? (
                                            <>
                                                <td className="px-6 py-3">
                                                    <input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <input
                                                        value={editPhone}
                                                        onChange={(e) => setEditPhone(e.target.value)}
                                                        maxLength={10}
                                                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <input
                                                        value={editAddress}
                                                        onChange={(e) => setEditAddress(e.target.value)}
                                                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleUpdate(customer.id)}
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
                                                <td className="px-6 py-4 text-gray-800 font-medium">{customer.name}</td>
                                                <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                                                <td className="px-6 py-4 text-gray-600">{customer.address}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEditClick(customer)}
                                                            className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(customer.id)}
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
                        {filteredCustomers.map((customer) => (
                            <div key={customer.id} className="px-4 py-4">
                                {editingId === customer.id ? (
                                    <div className="flex flex-col gap-3">
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Name"
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            placeholder="Phone"
                                            maxLength={10}
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            value={editAddress}
                                            onChange={(e) => setEditAddress(e.target.value)}
                                            placeholder="Address"
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdate(customer.id)}
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
                                            <p className="text-sm font-semibold text-gray-800">{customer.name}</p>
                                            <p className="text-sm text-gray-500">{customer.phone}</p>
                                            <p className="text-xs text-gray-400">{customer.address}</p>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <button
                                                onClick={() => handleEditClick(customer)}
                                                className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer.id)}
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

            <CustomerForm
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
            />
        </div>
    );
};

export default CustomerList;