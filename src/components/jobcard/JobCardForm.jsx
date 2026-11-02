import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchAllCustomers } from "../../features/customer/CustomerReducer";
import { fetchAllVehicles } from "../../features/vehicle/VehicleReducer";
import { fetchAllServices } from "../../features/servicess/ServiceReducer";
import { fetchAllParts } from "../../features/parts/PartsReducer";

import {
    fetchJobCardById,
    clearSelectedJobCard,
    createJobCard,
    updateJobCard,
    addServiceToJobCard,
    addPartToJobCard,
    estimateCost,
} from "../../features/jobcard/JobCardSlice";

/* ---------- pure helpers (no component state needed) ---------- */
const getCustomerName = (item) => item?.name ?? item?.customerName ?? "";

const getVehicleNumber = (item) =>
    item?.vehicleNumber ?? item?.registrationNumber ?? "";

const getServiceName = (item) => item?.serviceName ?? item?.name ?? "";

const getServiceCharge = (item) =>
    Number(item?.serviceCharge ?? item?.defaultFee ?? item?.labourFee ?? 0);

const getPartName = (item) =>
    item?.partsName ?? item?.partName ?? item?.name ?? "";

const getPartPrice = (item) => Number(item?.price ?? item?.priceUsed ?? 0);

const formatDateForInput = (date) => {
    if (!date) return "";

    const parts = date.split("-");

    if (parts[0].length === 2) {
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
    }
    return date;
};

/* ---------- shared mobile-friendly styles ---------- */
const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";
const dropdownClass =
    "absolute z-40 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border bg-white shadow-lg";
const optionClass =
    "flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm active:bg-gray-100";
const removeBtnClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl leading-none text-red-500";

const JobCardForm = ({ jobCardId, isOpen, onClose }) => {
    const dispatch = useDispatch();

    const { selectedJobCard, isLoadingSelectedJobCard, isSaving } =
        useSelector((state) => state.jobcards);

    const customers =
        useSelector((state) => state.customers?.customers) || [];
    const vehicles = useSelector((state) => state.vehicles?.vehicles) || [];
    const services = useSelector((state) => state.services?.services) || [];
    const parts = useSelector((state) => state.parts?.parts) || [];

    const [customerId, setCustomerId] = useState("");
    const [vehicleId, setVehicleId] = useState("");
    const [condition, setCondition] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");

    const [customerSearch, setCustomerSearch] = useState("");
    const [vehicleSearch, setVehicleSearch] = useState("");
    const [serviceSearch, setServiceSearch] = useState("");
    const [partSearch, setPartSearch] = useState("");

    const [showCustomerOptions, setShowCustomerOptions] = useState(false);
    const [showVehicleOptions, setShowVehicleOptions] = useState(false);
    const [showServiceOptions, setShowServiceOptions] = useState(false);
    const [showPartOptions, setShowPartOptions] = useState(false);

    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);

    const isEdit = Boolean(jobCardId);

    useEffect(() => {
        if (!isOpen) return;

        dispatch(fetchAllCustomers());
        dispatch(fetchAllVehicles());
        dispatch(fetchAllServices());
        dispatch(fetchAllParts());

        if (jobCardId) {
            dispatch(fetchJobCardById(jobCardId));
        }
    }, [dispatch, isOpen, jobCardId]);

    useEffect(() => {
        if (!isOpen) return;

        if (!jobCardId) {
            setCustomerId("");
            setVehicleId("");
            setCondition("");
            setDeliveryDate("");
            setCustomerSearch("");
            setVehicleSearch("");
            setServiceSearch("");
            setPartSearch("");
            setSelectedServices([]);
            setSelectedParts([]);
            return;
        }

        if (!selectedJobCard) return;

        setCondition(selectedJobCard.conditionNotes || "");
        setDeliveryDate(formatDateForInput(selectedJobCard.deliveryDate));

        const vehicle = vehicles.find(
            (item) =>
                String(item.id ?? item.vehicleId) ===
                String(selectedJobCard.vehicleId)
        );

        if (vehicle) {
            setVehicleId(vehicle.id ?? vehicle.vehicleId);
            setVehicleSearch(
                vehicle.vehicleNumber ?? vehicle.registrationNumber ?? ""
            );

            const linkedCustomerId =
                vehicle.customerId ?? vehicle.customer?.id;

            if (linkedCustomerId) {
                setCustomerId(linkedCustomerId);

                const customer = customers.find(
                    (item) =>
                        String(item.id ?? item.customerId) ===
                        String(linkedCustomerId)
                );

                if (customer) {
                    setCustomerSearch(
                        customer.name ?? customer.customerName ?? ""
                    );
                }
            }
        }

        if (selectedJobCard.customerName) {
            setCustomerSearch(selectedJobCard.customerName);
        }

        setSelectedServices(
            (selectedJobCard.services || []).map((item) => ({
                itemId: item.id,
                serviceId: item.serviceId,
                serviceName: item.serviceName || "",
                defaultFee: Number(item.defaultFee || 0),
                labourFee: Number(item.labourFee ?? item.defaultFee ?? 0),
            }))
        );

        setSelectedParts(
            (selectedJobCard.parts || []).map((item) => ({
                itemId: item.id,
                partId: item.partId,
                partName: item.partName || "",
                quantity: Number(item.quantity || 1),
                price: Number(item.price || 0),
                priceUsed: Number(item.priceUsed ?? item.price ?? 0),
            }))
        );
    }, [isOpen, jobCardId, selectedJobCard, vehicles, customers]);

    const filteredCustomers = useMemo(() => {
        const value = customerSearch.trim().toLowerCase();

        if (!value) return customers.slice(0, 10);

        return customers
            .filter((item) => getCustomerName(item).toLowerCase().includes(value))
            .slice(0, 10);
    }, [customers, customerSearch]);

    const filteredVehicles = useMemo(() => {
        if (!customerId) return [];

        const search = vehicleSearch.trim().toLowerCase();

        return vehicles
            .filter((vehicle) => {
                const belongsToCustomer =
                    String(vehicle.customerId) === String(customerId);

                const matchesSearch = (vehicle.vehicleNumber ?? "")
                    .toLowerCase()
                    .includes(search);

                return belongsToCustomer && matchesSearch;
            })
            .slice(0, 10);
    }, [vehicles, vehicleSearch, customerId]);

    const filteredServices = useMemo(() => {
        const value = serviceSearch.trim().toLowerCase();

        if (!value) return services.slice(0, 10);

        return services
            .filter((item) => getServiceName(item).toLowerCase().includes(value))
            .slice(0, 10);
    }, [services, serviceSearch]);

    const filteredParts = useMemo(() => {
        const value = partSearch.trim().toLowerCase();

        if (!value) return parts.slice(0, 10);

        return parts
            .filter((item) => getPartName(item).toLowerCase().includes(value))
            .slice(0, 10);
    }, [parts, partSearch]);

    const serviceTotal = selectedServices.reduce(
        (total, item) => total + Number(item.labourFee || 0),
        0
    );

    const partsTotal = selectedParts.reduce(
        (total, item) =>
            total + Number(item.quantity || 0) * Number(item.priceUsed || 0),
        0
    );

    const grandTotal = serviceTotal + partsTotal;

    const selectCustomer = (customer) => {
        const id = customer.id ?? customer.customerId;

        setCustomerId(id);
        setCustomerSearch(getCustomerName(customer));

        setVehicleId("");
        setVehicleSearch("");

        setShowCustomerOptions(false);
        setShowVehicleOptions(false);
    };

    const selectVehicle = (vehicle) => {
        setVehicleId(vehicle.id ?? vehicle.vehicleId);
        setVehicleSearch(getVehicleNumber(vehicle));

        const linkedCustomerId = vehicle.customerId ?? vehicle.customer?.id;

        if (linkedCustomerId) {
            setCustomerId(linkedCustomerId);

            const customer = customers.find(
                (item) =>
                    String(item.id ?? item.customerId) ===
                    String(linkedCustomerId)
            );

            if (customer) {
                setCustomerSearch(getCustomerName(customer));
            }
        }

        setShowVehicleOptions(false);
    };

    const addService = (service) => {
        const serviceId = service.id ?? service.serviceId;
        const serviceName = service.serviceName ?? service.name ?? "";
        const serviceCharge = Number(
            service.serviceCharge ?? service.defaultFee ?? 0
        );

        if (
            selectedServices.some(
                (item) => String(item.serviceId) === String(serviceId)
            )
        ) {
            toast.info("Service already added.");
            return;
        }

        setSelectedServices((prev) => [
            ...prev,
            {
                itemId: null,
                serviceId,
                serviceName,
                defaultFee: serviceCharge,
                labourFee: serviceCharge,
            },
        ]);

        setServiceSearch("");
        setShowServiceOptions(false);
    };

    const addPart = (part) => {
        const partId = part.id ?? part.partId;
        const partName = part.partsName ?? part.partName ?? part.name ?? "";
        const price = Number(part.price ?? 0);

        if (
            selectedParts.some((item) => String(item.partId) === String(partId))
        ) {
            toast.info("Part already added.");
            return;
        }

        setSelectedParts((prev) => [
            ...prev,
            {
                itemId: null,
                partId,
                partName,
                quantity: 1,
                price,
                priceUsed: price,
            },
        ]);

        setPartSearch("");
        setShowPartOptions(false);
    };

    const updateServiceFee = (index, value) => {
        setSelectedServices((prev) =>
            prev.map((item, i) =>
                i === index
                    ? { ...item, labourFee: value === "" ? "" : Number(value) }
                    : item
            )
        );
    };

    const updatePartQuantity = (index, value) => {
        setSelectedParts((prev) =>
            prev.map((item, i) =>
                i === index
                    ? { ...item, quantity: value === "" ? "" : Number(value) }
                    : item
            )
        );
    };

    const updatePartPrice = (index, value) => {
        setSelectedParts((prev) =>
            prev.map((item, i) =>
                i === index
                    ? { ...item, priceUsed: value === "" ? "" : Number(value) }
                    : item
            )
        );
    };

    const deleteService = async (index) => {
        const item = selectedServices[index];

        if (item.itemId) {
            try {
                await dispatch(removeService(item.itemId)).unwrap();
            } catch (error) {
                toast.error(error || "Failed to remove service.");
                return;
            }
        }

        setSelectedServices((prev) => prev.filter((_, i) => i !== index));
    };

    const deletePart = async (index) => {
        const item = selectedParts[index];

        if (item.itemId) {
            try {
                await dispatch(removePart(item.itemId)).unwrap();
            } catch (error) {
                toast.error(error || "Failed to remove part.");
                return;
            }
        }

        setSelectedParts((prev) => prev.filter((_, i) => i !== index));
    };

    const saveServices = async (id) => {
        for (const service of selectedServices) {
            if (!service.itemId) {
                await dispatch(
                    addServiceToJobCard({
                        jobCardId: id,
                        data: {
                            serviceId: service.serviceId,
                            labourFee: Number(service.labourFee || 0),
                        },
                    })
                ).unwrap();
            } else {
                await dispatch(
                    updateLabourFee({
                        itemId: service.itemId,
                        labourFee: Number(service.labourFee || 0),
                    })
                ).unwrap();
            }
        }
    };

    const saveParts = async (id) => {
        for (const part of selectedParts) {
            if (!part.itemId) {
                await dispatch(
                    addPartToJobCard({
                        jobCardId: id,
                        data: {
                            partId: part.partId,
                            quantity: Number(part.quantity || 1),
                            priceUsed: Number(part.priceUsed || 0),
                        },
                    })
                ).unwrap();
            } else {
                await dispatch(
                    updatePriceUsed({
                        itemId: part.itemId,
                        priceUsed: Number(part.priceUsed || 0),
                    })
                ).unwrap();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!vehicleId) {
            toast.error("Please select a vehicle.");
            return;
        }

        if (!condition.trim()) {
            toast.error("Please enter condition notes.");
            return;
        }

        const payload = {
            vehicleId: Number(vehicleId),
            condition: condition.trim(),
            deliveryDate: deliveryDate || null,
        };

        try {
            let id = jobCardId;

            if (isEdit) {
                await dispatch(
                    updateJobCard({ id: jobCardId, data: payload })
                ).unwrap();
            } else {
                const result = await dispatch(createJobCard(payload)).unwrap();

                id = result?.id;

                if (!id) {
                    throw new Error("Created job card ID was not returned.");
                }
            }

            await saveServices(id);
            await saveParts(id);

            toast.success(
                isEdit
                    ? "Job card updated successfully."
                    : "Job card created successfully."
            );

            onClose();
        } catch (error) {
            toast.error(error?.message || error || "Failed to save job card.");
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        // Bottom sheet on phones, centred card on larger screens.
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
            <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:rounded-3xl">
                {/* header */}
                <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
                    <h2 className="text-lg font-bold text-gray-900">
                        {isEdit ? "Edit Job Card" : "Create Job Card"}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-2xl leading-none text-gray-500"
                    >
                        ×
                    </button>
                </div>

                {isEdit && isLoadingSelectedJobCard ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading job card...
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        {/* scrollable fields */}
                        <div className="flex-1 space-y-5 overflow-y-auto p-4">
                            {/* customer */}
                            <div className="relative">
                                <label className={labelClass}>Customer</label>

                                <input
                                    type="text"
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        setShowCustomerOptions(true);
                                    }}
                                    onFocus={() => setShowCustomerOptions(true)}
                                    placeholder="Search customer"
                                    className={inputClass}
                                />

                                {showCustomerOptions && (
                                    <div className={dropdownClass}>
                                        {filteredCustomers.map((customer) => (
                                            <button
                                                key={customer.id ?? customer.customerId}
                                                type="button"
                                                onClick={() => selectCustomer(customer)}
                                                className={optionClass}
                                            >
                                                {getCustomerName(customer)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* vehicle */}
                            <div className="relative">
                                <label className={labelClass}>Vehicle</label>

                                <input
                                    type="text"
                                    value={vehicleSearch}
                                    onChange={(e) => {
                                        setVehicleSearch(e.target.value);
                                        setShowVehicleOptions(Boolean(customerId));
                                    }}
                                    onFocus={() => {
                                        if (customerId) setShowVehicleOptions(true);
                                    }}
                                    placeholder={
                                        customerId
                                            ? "Search this customer's vehicles"
                                            : "Select a customer first"
                                    }
                                    disabled={!customerId}
                                    className={inputClass}
                                />

                                {showVehicleOptions && (
                                    <div className={dropdownClass}>
                                        {filteredVehicles.map((vehicle) => (
                                            <button
                                                key={vehicle.id ?? vehicle.vehicleId}
                                                type="button"
                                                onClick={() => selectVehicle(vehicle)}
                                                className={optionClass}
                                            >
                                                {getVehicleNumber(vehicle)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* delivery date */}
                            <div>
                                <label className={labelClass}>Delivery Date</label>

                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            {/* condition notes */}
                            <div>
                                <label className={labelClass}>Condition Notes</label>

                                <textarea
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    rows={3}
                                    placeholder="Describe the vehicle's condition"
                                    className={inputClass}
                                />
                            </div>

                            {/* services */}
                            <div>
                                <label className={labelClass}>Services</label>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={serviceSearch}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setServiceSearch(value);
                                            setShowServiceOptions(value.trim().length > 0);
                                        }}
                                        onFocus={() => {
                                            if (serviceSearch.trim().length > 0) {
                                                setShowServiceOptions(true);
                                            }
                                        }}
                                        placeholder="Search service"
                                        className={inputClass}
                                    />

                                    {showServiceOptions && (
                                        <div className={dropdownClass}>
                                            {filteredServices.map((service) => (
                                                <button
                                                    key={service.id ?? service.serviceId}
                                                    type="button"
                                                    onClick={() => addService(service)}
                                                    className={optionClass}
                                                >
                                                    <span>{getServiceName(service)}</span>
                                                    <span className="shrink-0 text-gray-500">
                                                        ₹{getServiceCharge(service).toFixed(2)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 space-y-2">
                                    {selectedServices.map((service, index) => (
                                        <div
                                            key={
                                                service.itemId ??
                                                `service-${service.serviceId}-${index}`
                                            }
                                            className="rounded-xl border border-gray-200 p-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-800">
                                                        {service.serviceName}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Default: ₹
                                                        {Number(service.defaultFee || 0).toFixed(2)}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => deleteService(index)}
                                                    aria-label="Remove service"
                                                    className={removeBtnClass}
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <label className="mt-2 block text-xs text-gray-500">
                                                Labour fee (₹)
                                            </label>
                                            <input
                                                type="number"
                                                inputMode="decimal"
                                                min="0"
                                                step="0.01"
                                                value={service.labourFee}
                                                onChange={(e) =>
                                                    updateServiceFee(index, e.target.value)
                                                }
                                                className={`${inputClass} mt-1`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* parts */}
                            <div>
                                <label className={labelClass}>Parts</label>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={partSearch}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setPartSearch(value);
                                            setShowPartOptions(value.trim().length > 0);
                                        }}
                                        onFocus={() => {
                                            if (partSearch.trim().length > 0) {
                                                setShowPartOptions(true);
                                            }
                                        }}
                                        placeholder="Search parts"
                                        className={inputClass}
                                    />

                                    {showPartOptions && (
                                        <div className={dropdownClass}>
                                            {filteredParts.map((part) => (
                                                <button
                                                    key={part.id ?? part.partId}
                                                    type="button"
                                                    onClick={() => addPart(part)}
                                                    className={optionClass}
                                                >
                                                    <span>{getPartName(part)}</span>
                                                    <span className="shrink-0 text-gray-500">
                                                        ₹{getPartPrice(part).toFixed(2)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 space-y-2">
                                    {selectedParts.map((part, index) => (
                                        <div
                                            key={part.itemId ?? `part-${part.partId}-${index}`}
                                            className="rounded-xl border border-gray-200 p-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-800">
                                                        {part.partName}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Price: ₹{Number(part.price || 0).toFixed(2)}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => deletePart(index)}
                                                    aria-label="Remove part"
                                                    className={removeBtnClass}
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <div className="mt-2 grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500">
                                                        Quantity
                                                    </label>
                                                    <input
                                                        type="number"
                                                        inputMode="numeric"
                                                        min="1"
                                                        step="1"
                                                        value={part.quantity}
                                                        onChange={(e) =>
                                                            updatePartQuantity(index, e.target.value)
                                                        }
                                                        className={`${inputClass} mt-1`}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-gray-500">
                                                        Price used (₹)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        inputMode="decimal"
                                                        min="0"
                                                        step="0.01"
                                                        value={part.priceUsed}
                                                        onChange={(e) =>
                                                            updatePartPrice(index, e.target.value)
                                                        }
                                                        className={`${inputClass} mt-1`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* totals */}
                            <div className="rounded-xl bg-gray-50 p-4">
                                <div className="flex justify-between py-1 text-sm">
                                    <span className="text-gray-600">Service Total</span>
                                    <span className="font-medium">₹{serviceTotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between py-1 text-sm">
                                    <span className="text-gray-600">Parts Total</span>
                                    <span className="font-medium">₹{partsTotal.toFixed(2)}</span>
                                </div>

                                <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
                                    <span>Grand Total</span>
                                    <span>₹{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* sticky action bar: always reachable with the thumb */}
                        <div className="flex shrink-0 gap-3 border-t bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-gray-200 py-3 font-medium text-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-[2] rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                {isSaving
                                    ? "Saving..."
                                    : isEdit
                                        ? "Update Job Card"
                                        : "Create Job Card"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default JobCardForm;