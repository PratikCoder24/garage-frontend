import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addPart,
    updatePart,
} from "../../features/parts/PartsReducer";
import {
    addService,
    updateService,
} from "../../features/servicess/ServiceReducer";
import { successToast, errorToast } from "../../toast/Toast";

const CatalogueForm = ({
    type,
    isOpen,
    onClose,
    existingItem = null,
}) => {
    const dispatch = useDispatch();

    const partsLoading = useSelector((state) => state.parts.isLoading);
    const servicesLoading = useSelector((state) => state.services.isLoading);

    const isParts = type === "parts";
    const isEditMode = !!existingItem;
    const isLoading = isParts ? partsLoading : servicesLoading;

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        if (existingItem) {
            setName(
            isParts
                ? existingItem.partsName || ""
                : existingItem.serviceName || ""
        );

        setPrice(
            isParts
                ? existingItem.price ?? ""
                : existingItem.serviceCharge ?? ""
        );
        } else {
            setName("");
            setPrice("");
        }
    }, [existingItem, isOpen ,isParts]);

    const resetForm = () => {
        setName("");
        setPrice("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim() || !price) {
            errorToast("Please fill in all required fields");
            return;
        }

        if (Number(price) < 0) {
            errorToast("Price cannot be negative");
            return;
        }

        try {
            if (isParts) {
                const data = {
                    partsName: name.trim(),
                    price: Number(price),
                };

                if (isEditMode) {
                    await dispatch(
                        updatePart({
                            id: existingItem.id,
                            data,
                        })
                    ).unwrap();

                    successToast("Part updated successfully!");
                } else {
                    await dispatch(addPart(data)).unwrap();

                    successToast("Part added successfully!");
                }
            } else {
                const data = {
                    serviceName: name.trim(),
                    serviceCharge: Number(price),
                };

                if (isEditMode) {
                    await dispatch(
                        updateService({
                            id: existingItem.id,
                            data,
                        })
                    ).unwrap();

                    successToast("Service updated successfully!");
                } else {
                    await dispatch(addService(data)).unwrap();

                    successToast("Service added successfully!");
                }
            }

            handleClose();
        } catch (error) {
            errorToast(
                error || `Failed to ${isEditMode ? "update" : "add"} ${isParts ? "part" : "service"}!`
            );
        }
    };

    if (!isOpen) return null;

    const title = isEditMode
        ? `Edit ${isParts ? "Part" : "Service"}`
        : `Add New ${isParts ? "Part" : "Service"}`;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {title}
                        </h2>

                        <p className="text-sm text-gray-500 mt-0.5">
                            {isEditMode
                                ? `Update ${isParts ? "part" : "service"} details`
                                : `Enter ${isParts ? "part" : "service"} details below`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="px-6 py-5 flex flex-col gap-4"
                >

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            {isParts ? "Part Name" : "Service Name"}{" "}
                            <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={
                                isParts
                                    ? "e.g. Engine Oil"
                                    : "e.g. General Service"
                            }
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Price <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                ₹
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
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
                            {isLoading
                                ? "Saving..."
                                : isEditMode
                                    ? `Update ${isParts ? "Part" : "Service"}`
                                    : `Add ${isParts ? "Part" : "Service"}`}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CatalogueForm;