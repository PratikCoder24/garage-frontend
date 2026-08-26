import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCustomers } from "../../features/customer/CustomerReducer";
import { fetchAllVehicles } from "../../features/vehicle/VehicleReducer";
import { fetchAllServices } from "../../features/servicess/ServiceReducer";
import { fetchAllParts } from "../../features/parts/PartsReducer";
import {
    createJobCard,
    addServiceToJobCard,
    addPartToJobCard,
    estimateCost,
} from "../../features/jobcard/JobCardSlice";

const JobCardForm = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();

    // ==========================================
    // REDUX DATA
    // ==========================================

    const customers = useSelector((state) => state.customers.customers) ?? [];
    const vehicles = useSelector((state) => state.vehicles.vehicles) ?? [];
    const serviceCatalogue = useSelector((state) => state.services.services) ?? [];
    const partCatalogue = useSelector((state) => state.parts.parts) ?? [];

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchAllCustomers());
            dispatch(fetchAllVehicles());
            dispatch(fetchAllServices());
            dispatch(fetchAllParts());
        }
    }, [isOpen, dispatch]);

    const { isLoading, error: jobCardError } = useSelector((state) => state.jobcards);

    // ==========================================
    // BASIC FORM STATE
    // ==========================================

    const [customerId, setCustomerId] = useState("");
    const [vehicleId, setVehicleId] = useState("");
    const [conditionNotes, setConditionNotes] = useState("");

    // ==========================================
    // SEARCH STATE
    // ==========================================

    const [customerSearch, setCustomerSearch] = useState("");
    const [vehicleSearch, setVehicleSearch] = useState("");
    const [serviceSearch, setServiceSearch] = useState("");
    const [partSearch, setPartSearch] = useState("");

    // ==========================================
    // DROPDOWN STATE
    // ==========================================

    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [showPartDropdown, setShowPartDropdown] = useState(false);

    // ==========================================
    // SELECTED ITEMS (each carries quantity now)
    // ==========================================

    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);

    // ==========================================
    // ERROR / LOADING
    // ==========================================

    const [formError, setFormError] = useState("");
    const [creating, setCreating] = useState(false);

    // ==========================================
    // RESET
    // ==========================================

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setCustomerId("");
        setVehicleId("");
        setConditionNotes("");

        setCustomerSearch("");
        setVehicleSearch("");
        setServiceSearch("");
        setPartSearch("");

        setSelectedServices([]);
        setSelectedParts([]);

        setShowCustomerDropdown(false);
        setShowVehicleDropdown(false);
        setShowServiceDropdown(false);
        setShowPartDropdown(false);

        setFormError("");
        setCreating(false);
    };

    const handleClose = () => {
        resetForm();
        onClose?.();
    };

    // ==========================================
    // CUSTOMER HELPERS
    // ==========================================

    const getCustomerName = (customer) =>
        customer?.name ?? customer?.customerName ?? `Customer #${customer?.id ?? "?"}`;

    const getCustomerPhone = (customer) => customer?.phone ?? "";

    // ==========================================
    // VEHICLE HELPERS
    // ==========================================

    const getVehicleNumber = (vehicle) => vehicle?.vehicleNumber ?? "";
    const getVehicleModel = (vehicle) => vehicle?.model ?? "";
    const getVehicleCompany = (vehicle) => vehicle?.companyName ?? "";

    // ==========================================
    // SERVICE HELPERS
    // ACTUAL DTO: id, serviceName, defaultFee, labourFee
    // ==========================================

    const getServiceName = (service) =>
        service?.serviceName ?? service?.name ?? `Service #${service?.id ?? "?"}`;

    const getServicePrice = (service) => {
    const val = service?.serviceCharge;
    return Number.isFinite(Number(val)) ? Number(val) : 0;
};

    // ==========================================
    // PART HELPERS
    // ACTUAL DTO: id, partName, price, priceUsed
    // ==========================================

    const getPartName = (part) =>
        part?.partName ?? part?.partsName ?? part?.name ?? `Part #${part?.id ?? "?"}`;

    const getPartPrice = (part) => {
        const val = part?.price ?? part?.priceUsed;
        return Number.isFinite(Number(val)) ? Number(val) : 0;
    };

    // ==========================================
    // FILTER CUSTOMERS
    // ==========================================

    const filteredCustomers = useMemo(() => {
        const search = customerSearch.trim().toLowerCase();
        if (!search) return customers;

        return customers.filter((customer) => {
            const name = getCustomerName(customer).toLowerCase();
            const phone = getCustomerPhone(customer).toLowerCase();
            return name.includes(search) || phone.includes(search);
        });
    }, [customers, customerSearch]);

    // ==========================================
    // FILTER VEHICLES
    // ==========================================

    const customerVehicles = useMemo(() => {
        if (!customerId) return [];
        return vehicles.filter((vehicle) => String(vehicle.customerId) === String(customerId));
    }, [vehicles, customerId]);

    const filteredVehicles = useMemo(() => {
        const search = vehicleSearch.trim().toLowerCase();
        if (!search) return customerVehicles;

        return customerVehicles.filter((vehicle) => {
            const number = getVehicleNumber(vehicle).toLowerCase();
            const model = getVehicleModel(vehicle).toLowerCase();
            const company = getVehicleCompany(vehicle).toLowerCase();
            return number.includes(search) || model.includes(search) || company.includes(search);
        });
    }, [customerVehicles, vehicleSearch]);

    // ==========================================
    // FILTER SERVICES / PARTS
    // ==========================================

    const filteredServices = useMemo(() => {
        const search = serviceSearch.trim().toLowerCase();
        if (!search) return serviceCatalogue;
        return serviceCatalogue.filter((service) =>
            getServiceName(service).toLowerCase().includes(search)
        );
    }, [serviceCatalogue, serviceSearch]);

    const filteredParts = useMemo(() => {
        const search = partSearch.trim().toLowerCase();
        if (!search) return partCatalogue;
        return partCatalogue.filter((part) =>
            getPartName(part).toLowerCase().includes(search)
        );
    }, [partCatalogue, partSearch]);

    // ==========================================
    // CUSTOMER / VEHICLE SELECT
    // ==========================================

    const handleSelectCustomer = (customer) => {
        if (!customer || customer.id == null) return;

        setCustomerId(customer.id);
        setCustomerSearch(`${getCustomerName(customer)} - ${getCustomerPhone(customer)}`);

        setVehicleId("");
        setVehicleSearch("");

        setShowCustomerDropdown(false);
        setFormError("");
    };

    const handleSelectVehicle = (vehicle) => {
        if (!vehicle || vehicle.vehicleId == null) return;

        setVehicleId(vehicle.vehicleId);
        setVehicleSearch(
            `${getVehicleNumber(vehicle)} - ${getVehicleCompany(vehicle)} ${getVehicleModel(vehicle)}`
        );

        setShowVehicleDropdown(false);
        setFormError("");
    };

    // ==========================================
    // SERVICE SELECT (crash-safe, quantity default 1)
    // ==========================================

    const handleSelectService = (service) => {
        if (!service || service.id == null) return;

        const exists = selectedServices.some(
            (item) => String(item.catalogueId) === String(service.id)
        );

        if (exists) {
            setFormError("This service is already added.");
            return;
        }

        setSelectedServices((prev) => [
            ...prev,
            {
                catalogueId: service.id,
                name: getServiceName(service),
                labourFee: getServicePrice(service), // unit fee
                quantity: 1,
            },
        ]);

        setServiceSearch("");
        setShowServiceDropdown(false);
        setFormError("");
    };

    // ==========================================
    // PART SELECT (crash-safe, quantity default 1)
    // ==========================================

    const handleSelectPart = (part) => {
        if (!part || part.id == null) return;

        const exists = selectedParts.some(
            (item) => String(item.catalogueId) === String(part.id)
        );

        if (exists) {
            setFormError("This part is already added.");
            return;
        }

        setSelectedParts((prev) => [
            ...prev,
            {
                catalogueId: part.id,
                name: getPartName(part),
                priceUsed: getPartPrice(part), // unit price
                quantity: 1,
            },
        ]);

        setPartSearch("");
        setShowPartDropdown(false);
        setFormError("");
    };

    // ==========================================
    // SERVICE / PART FEE (UNIT PRICE) CHANGE
    // ==========================================

    const handleServiceFeeChange = (id, value) => {
        setSelectedServices((prev) =>
            prev.map((service) =>
                String(service.catalogueId) === String(id)
                    ? { ...service, labourFee: value }
                    : service
            )
        );
    };

    const handlePartPriceChange = (id, value) => {
        setSelectedParts((prev) =>
            prev.map((part) =>
                String(part.catalogueId) === String(id) ? { ...part, priceUsed: value } : part
            )
        );
    };

    // ==========================================
    // QUANTITY +/- CONTROLS
    // ==========================================

    const handleServiceQtyChange = (id, delta) => {
        setSelectedServices((prev) =>
            prev.map((service) =>
                String(service.catalogueId) === String(id)
                    ? { ...service, quantity: Math.max(1, (Number(service.quantity) || 1) + delta) }
                    : service
            )
        );
    };

    const handlePartQtyChange = (id, delta) => {
        setSelectedParts((prev) =>
            prev.map((part) =>
                String(part.catalogueId) === String(id)
                    ? { ...part, quantity: Math.max(1, (Number(part.quantity) || 1) + delta) }
                    : part
            )
        );
    };

    // ==========================================
    // REMOVE SERVICE / PART
    // ==========================================

    const handleRemoveService = (id) => {
        setSelectedServices((prev) =>
            prev.filter((service) => String(service.catalogueId) !== String(id))
        );
    };

    const handleRemovePart = (id) => {
        setSelectedParts((prev) =>
            prev.filter((part) => String(part.catalogueId) !== String(id))
        );
    };

    // ==========================================
    // TOTALS (unit price × quantity)
    // ==========================================

    const servicesTotal = useMemo(() => {
        return selectedServices.reduce(
            (total, service) =>
                total + Number(service.labourFee || 0) * Number(service.quantity || 1),
            0
        );
    }, [selectedServices]);

    const partsTotal = useMemo(() => {
        return selectedParts.reduce(
            (total, part) => total + Number(part.priceUsed || 0) * Number(part.quantity || 1),
            0
        );
    }, [selectedParts]);

    const grandTotal = servicesTotal + partsTotal;

    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!customerId) {
            setFormError("Please select a customer.");
            return;
        }

        if (!vehicleId) {
            setFormError("Please select a vehicle.");
            return;
        }

        if (!conditionNotes.trim()) {
    setFormError("Please enter the vehicle condition or complaint notes.");
    return;
}

        if (selectedServices.length === 0 && selectedParts.length === 0) {
            setFormError("Please add at least one service or part.");
            return;
        }

        setCreating(true);

        try {
            const jobCardPayload = {
                customerId: Number(customerId),
                vehicleId: Number(vehicleId),
                condition: conditionNotes.trim(),
            };

            const createdJobCard = await dispatch(createJobCard(jobCardPayload)).unwrap();

            const jobCardId = createdJobCard?.id ?? createdJobCard?.jobCardId;

            if (!jobCardId) {
                throw new Error("Job card ID was not returned.");
            }

            // ADD SERVICES — fee sent as unit fee × quantity (total line fee)
            for (const service of selectedServices) {
                const qty = Number(service.quantity) || 1;
                const unitFee = Number(service.labourFee) || 0;

                await dispatch(
                    addServiceToJobCard({
                        jobCardId,
                        data: {
                            serviceId: Number(service.catalogueId),
                            fee: unitFee * qty,
                            quantity: qty,
                        },
                    })
                ).unwrap();
            }

            // ADD PARTS — priceUsed sent as unit price × quantity (total line price)
            for (const part of selectedParts) {
                const qty = Number(part.quantity) || 1;
                const unitPrice = Number(part.priceUsed) || 0;

                await dispatch(
                    addPartToJobCard({
                        jobCardId,
                        data: {
                            partId: Number(part.catalogueId),
                            priceUsed: unitPrice * qty,
                            quantity: qty,
                        },
                    })
                ).unwrap();
            }

            await dispatch(estimateCost(jobCardId)).unwrap();

            handleClose();
        } catch (error) {
            setFormError(typeof error === "string" ? error : error?.message ?? "Failed to create job card.");
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Create Job Card</h2>
                        <p className="mt-1 text-sm text-gray-500">Create a new repair job</p>
                    </div>
                    <button type="button" onClick={handleClose} className="text-2xl text-gray-400 hover:text-gray-700">
                        ×
                    </button>
                </div>

                <div className="overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-7 px-6 py-6">

                        {(formError || jobCardError) && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {formError || jobCardError}
                            </div>
                        )}

                        {/* CUSTOMER & VEHICLE */}
                        <section>
                            <h3 className="mb-4 text-base font-semibold text-gray-800">Customer & Vehicle</h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* CUSTOMER SEARCH */}
                                <div className="relative">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Customer<span className="text-red-500"> *</span>
                                    </label>

                                    <input
                                        type="text"
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setCustomerId("");
                                            setVehicleId("");
                                            setVehicleSearch("");
                                            setShowCustomerDropdown(true);
                                        }}
                                        onFocus={() => setShowCustomerDropdown(true)}
                                        placeholder="Search customer by name or phone..."
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    />

                                    {showCustomerDropdown && (
                                        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                            {filteredCustomers.length > 0 ? (
                                                filteredCustomers.map((customer) => (
                                                    <button
                                                        type="button"
                                                        key={customer.id}
                                                        onClick={() => handleSelectCustomer(customer)}
                                                        className="block w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                                                    >
                                                        <p className="text-sm font-medium text-gray-800">{getCustomerName(customer)}</p>
                                                        <p className="mt-1 text-xs text-gray-500">{getCustomerPhone(customer)}</p>
                                                    </button>
                                                ))
                                            ) : customerSearch.trim() ? (
                                                <div className="px-4 py-4 text-center text-sm text-gray-500">No customer found</div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                {/* VEHICLE SEARCH */}
                                <div className="relative">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Vehicle<span className="text-red-500"> *</span>
                                    </label>

                                    <input
                                        type="text"
                                        value={vehicleSearch}
                                        disabled={!customerId}
                                        onChange={(e) => {
                                            setVehicleSearch(e.target.value);
                                            setVehicleId("");
                                            setShowVehicleDropdown(true);
                                        }}
                                        onFocus={() => {
                                            if (customerId) setShowVehicleDropdown(true);
                                        }}
                                        placeholder={customerId ? "Search vehicle..." : "Select customer first"}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-50 focus:border-blue-500"
                                    />

                                    {showVehicleDropdown && customerId && (
                                        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                            {filteredVehicles.length > 0 ? (
                                                filteredVehicles.map((vehicle) => (
                                                    <button
                                                        type="button"
                                                        key={vehicle.vehicleId}
                                                        onClick={() => handleSelectVehicle(vehicle)}
                                                        className="block w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                                                    >
                                                        <p className="text-sm font-semibold text-gray-800">{vehicle.vehicleNumber}</p>
                                                        <p className="mt-1 text-xs text-gray-500">{vehicle.companyName} {vehicle.model}</p>
                                                    </button>
                                                ))
                                            ) : vehicleSearch.trim() ? (
                                                <div className="px-4 py-4 text-center text-sm text-gray-500">No vehicle found</div>
                                            ) : customerVehicles.length === 0 ? (
                                                <div className="px-4 py-4 text-center text-sm text-gray-500">No vehicles for this customer</div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Condition / Complaint Notes</label>
                                <textarea
                                    value={conditionNotes}
                                    onChange={(e) => setConditionNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Enter vehicle condition or customer complaint..."
                                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />
                            </div>
                        </section>

                        {/* SERVICES */}
                        <section>
                            <div className="mb-4">
                                <h3 className="text-base font-semibold text-gray-800">Services</h3>
                                <p className="mt-1 text-sm text-gray-500">Search and select services.</p>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={serviceSearch}
                                    onChange={(e) => {
                                        setServiceSearch(e.target.value);
                                        setShowServiceDropdown(true);
                                    }}
                                    onFocus={() => setShowServiceDropdown(true)}
                                    placeholder="Search service..."
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />

                                {showServiceDropdown && (
                                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                        {filteredServices.length > 0 ? (
                                            filteredServices.map((service) => (
                                                <button
                                                    type="button"
                                                    key={service.id}
                                                    onClick={() => handleSelectService(service)}
                                                    className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                                                >
                                                    <span className="text-sm font-medium text-gray-800">{getServiceName(service)}</span>
                                                    <span className="text-sm text-gray-500">₹{getServicePrice(service).toFixed(2)}</span>
                                                </button>
                                            ))
                                        ) : serviceSearch.trim() ? (
                                            <div className="px-4 py-4 text-center text-sm text-gray-500">No service found</div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {/* SELECTED SERVICES */}
                            <div className="mt-4 space-y-3">
                                {selectedServices.map((service) => (
                                    <div key={service.catalogueId} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-800">{service.name}</p>
                                                <p className="mt-1 text-xs text-gray-400">Labour Fee (unit)</p>
                                            </div>

                                            <div className="w-28">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={service.labourFee}
                                                    onChange={(e) => handleServiceFeeChange(service.catalogueId, e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleServiceQtyChange(service.catalogueId, -1)}
                                                    className="h-8 w-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                >
                                                    −
                                                </button>
                                                <span className="w-6 text-center text-sm font-medium">{service.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleServiceQtyChange(service.catalogueId, 1)}
                                                    className="h-8 w-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="w-24 text-right text-sm font-semibold text-gray-700">
                                                ₹{(Number(service.labourFee || 0) * Number(service.quantity || 1)).toFixed(2)}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveService(service.catalogueId)}
                                                className="text-sm font-medium text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {selectedServices.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-gray-200 py-5 text-center text-sm text-gray-400">
                                        No services selected
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 text-right text-sm font-semibold text-gray-700">
                                Services Total: ₹{servicesTotal.toFixed(2)}
                            </div>
                        </section>

                        {/* PARTS */}
                        <section>
                            <div className="mb-4">
                                <h3 className="text-base font-semibold text-gray-800">Parts</h3>
                                <p className="mt-1 text-sm text-gray-500">Search and select parts.</p>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={partSearch}
                                    onChange={(e) => {
                                        setPartSearch(e.target.value);
                                        setShowPartDropdown(true);
                                    }}
                                    onFocus={() => setShowPartDropdown(true)}
                                    placeholder="Search part..."
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                />

                                {showPartDropdown && (
                                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                        {filteredParts.length > 0 ? (
                                            filteredParts.map((part) => (
                                                <button
                                                    type="button"
                                                    key={part.id}
                                                    onClick={() => handleSelectPart(part)}
                                                    className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                                                >
                                                    <span className="text-sm font-medium text-gray-800">{getPartName(part)}</span>
                                                    <span className="text-sm text-gray-500">₹{getPartPrice(part).toFixed(2)}</span>
                                                </button>
                                            ))
                                        ) : partSearch.trim() ? (
                                            <div className="px-4 py-4 text-center text-sm text-gray-500">No part found</div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {/* SELECTED PARTS */}
                            <div className="mt-4 space-y-3">
                                {selectedParts.map((part) => (
                                    <div key={part.catalogueId} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-800">{part.name}</p>
                                                <p className="mt-1 text-xs text-gray-400">Price Used (unit)</p>
                                            </div>

                                            <div className="w-28">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={part.priceUsed}
                                                    onChange={(e) => handlePartPriceChange(part.catalogueId, e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handlePartQtyChange(part.catalogueId, -1)}
                                                    className="h-8 w-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                >
                                                    −
                                                </button>
                                                <span className="w-6 text-center text-sm font-medium">{part.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePartQtyChange(part.catalogueId, 1)}
                                                    className="h-8 w-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="w-24 text-right text-sm font-semibold text-gray-700">
                                                ₹{(Number(part.priceUsed || 0) * Number(part.quantity || 1)).toFixed(2)}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemovePart(part.catalogueId)}
                                                className="text-sm font-medium text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {selectedParts.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-gray-200 py-5 text-center text-sm text-gray-400">
                                        No parts selected
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 text-right text-sm font-semibold text-gray-700">
                                Parts Total: ₹{partsTotal.toFixed(2)}
                            </div>
                        </section>

                        {/* SUMMARY */}
                        <section className="rounded-xl bg-gray-50 p-5">
                            <h3 className="mb-4 font-semibold text-gray-800">Estimate</h3>

                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Services</span>
                                <span>₹{servicesTotal.toFixed(2)}</span>
                            </div>

                            <div className="mt-2 flex justify-between text-sm text-gray-600">
                                <span>Parts</span>
                                <span>₹{partsTotal.toFixed(2)}</span>
                            </div>

                            <div className="my-4 border-t border-gray-200" />

                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-800">Grand Total</span>
                                <span className="text-xl font-bold text-blue-600">₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </section>

                        {/* FOOTER */}
                        <div className="flex gap-3 border-t pt-5">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={creating}
                                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={creating || isLoading}
                                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {creating ? "Creating..." : "Create Job Card"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JobCardForm;