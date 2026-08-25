import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllParts,
    deletePart,
} from "../../features/parts/PartsReducer";
import {
    fetchAllServices,
    deleteService,
} from "../../features/servicess/ServiceReducer";
import { successToast, errorToast, deleteToast } from "../../toast/Toast";
import CatalogueForm from "./CatalogueForm";

const CatalogueLists = () => {
    const dispatch = useDispatch();

    const {
        parts,
        isLoading: partsLoading,
        error: partsError,
    } = useSelector((state) => state.parts);

    const {
        services,
        isLoading: servicesLoading,
        error: servicesError,
    } = useSelector((state) => state.services);

    const [type, setType] = useState("parts");
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const isParts = type === "parts";

    const items = isParts ? parts : services;
    const isLoading = isParts ? partsLoading : servicesLoading;
    const error = isParts ? partsError : servicesError;

    useEffect(() => {
        dispatch(fetchAllParts());
        dispatch(fetchAllServices());
    }, [dispatch]);

    const filteredItems = items.filter((item) => {
        const name = isParts
            ? item.partsName
            : item.serviceName;

        return name
            ?.toLowerCase()
            .includes(search.trim().toLowerCase());
    });

    const handleTypeChange = (newType) => {
        setType(newType);
        setSearch("");
        setSelectedItem(null);
        setFormOpen(false);
    };

    const handleAdd = () => {
        setSelectedItem(null);
        setFormOpen(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setFormOpen(true);
    };

    const handleDelete = (id) => {
        const itemType = isParts ? "part" : "service";

        deleteToast(
            `Are you sure you want to delete this ${itemType}?`,
            async () => {
                try {
                    if (isParts) {
                        await dispatch(deletePart(id)).unwrap();
                        successToast("Part deleted successfully!");
                    } else {
                        await dispatch(deleteService(id)).unwrap();
                        successToast("Service deleted successfully!");
                    }
                } catch (error) {
                    errorToast(
                        error ||
                        `Failed to delete ${itemType}!`
                    );
                }
            }
        );
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setSelectedItem(null);
    };

    if (isLoading && items.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
                <p className="text-sm text-gray-400">
                    Loading {isParts ? "parts" : "services"}...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
                <p className="text-sm text-red-400">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            <div className="px-4 py-4 border-b border-gray-100 sm:px-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 className="text-base font-semibold text-gray-800">
                            Catalogue
                        </h2>

                        <p className="text-xs text-gray-400 mt-0.5">
                            {items.length} {isParts ? "parts" : "services"} total
                        </p>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                    >
                        + Add {isParts ? "Part" : "Service"}
                    </button>
                </div>

                <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex p-1 bg-gray-100 rounded-lg w-full sm:w-auto">

                        <button
                            onClick={() => handleTypeChange("parts")}
                            className={`flex-1 sm:flex-none px-5 py-2 rounded-md text-sm font-medium transition ${
                                isParts
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Parts
                        </button>

                        <button
                            onClick={() => handleTypeChange("services")}
                            className={`flex-1 sm:flex-none px-5 py-2 rounded-md text-sm font-medium transition ${
                                !isParts
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Services
                        </button>

                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search ${isParts ? "parts" : "services"}...`}
                        className="w-full sm:w-56 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />

                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-gray-400">
                        {search
                            ? `No ${isParts ? "parts" : "services"} found`
                            : `No ${isParts ? "parts" : "services"} yet`}
                    </p>

                    {!search && (
                        <button
                            onClick={handleAdd}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                            + Add your first {isParts ? "part" : "service"}
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">

                            <thead>
                                <tr className="bg-gray-50 text-left">

                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        {isParts ? "Part Name" : "Service Name"}
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Price
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">

                                {filteredItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >

                                        <td className="px-6 py-4 text-gray-800 font-medium">
                                            {isParts
                                                ? item.partsName
                                                : item.serviceName}
                                        </td>

                                        <td className="px-6 py-4 text-gray-600">
                                            ₹
                                            {isParts
                                                ? item.price
                                                : item.serviceCharge}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">

                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>

                    <div className="sm:hidden divide-y divide-gray-100">

                        {filteredItems.map((item) => (

                            <div
                                key={item.id}
                                className="px-4 py-4"
                            >

                                <div className="flex items-start justify-between gap-3">

                                    <div className="flex flex-col gap-1 min-w-0">

                                        <p className="text-sm font-semibold text-gray-800">
                                            {isParts
                                                ? item.partsName
                                                : item.serviceName}
                                        </p>

                                        <p className="text-sm font-medium text-gray-600">
                                            ₹
                                            {isParts
                                                ? item.price
                                                : item.serviceCharge}
                                        </p>

                                        <p className="text-xs text-gray-400">
                                            {isParts
                                                ? "Part"
                                                : "Service"}
                                        </p>

                                    </div>

                                    <div className="flex flex-col gap-2 shrink-0">

                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>
                </>
            )}

            <CatalogueForm
                type={type}
                isOpen={formOpen}
                existingItem={selectedItem}
                onClose={handleFormClose}
            />

        </div>
    );
};

export default CatalogueLists;