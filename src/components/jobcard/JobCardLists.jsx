
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
    fetchJobCards,
    updateJobCardStatus,
} from "../../features/jobcard/JobCardSlice";

import {
    generateInvoice,
    fetchInvoiceByJobCardId,
} from "../../features/invoice/InvoiceReducer";

const JobCardLists = ({ onView, onEdit, onViewInvoice }) => {
    const dispatch = useDispatch();

    const {
        jobCards = [],
        isLoading,
        isStatusUpdating,
        statusUpdatingId,
        error,
    } = useSelector((state) => state.jobcards);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [generatedInvoices, setGeneratedInvoices] = useState({});
    const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);

    const getJobCardId = (jobCard) =>
        jobCard?.id ?? jobCard?.jobCardId;

    const getCustomerName = (jobCard) =>
        jobCard?.customerName ?? "-";

    const getVehicleNumber = (jobCard) =>
        jobCard?.vehicleNumber ?? "-";

    const getStatus = (jobCard) =>
        String(jobCard?.status ?? "PENDING").toUpperCase();

    // Load job cards, then load any existing invoices.
    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                const cards = await dispatch(fetchJobCards()).unwrap();

                if (cancelled) return;

                const completedCards = cards.filter(
                    (card) => getStatus(card) === "COMPLETED"
                );

                const results = await Promise.all(
                    completedCards.map(async (card) => {
                        const jobCardId = getJobCardId(card);

                        try {
                            const response = await dispatch(
                                fetchInvoiceByJobCardId(jobCardId)
                            ).unwrap();

                            // Supports either a direct DTO or a wrapped response.
                            const data = response?.data ?? response;

                            const invoice = {
                                ...data,
                                id:
                                    data?.id ??
                                    data?.invoiceId ??
                                    data?.invoice_id,
                            };

                            return invoice.id != null
                                ? [jobCardId, invoice]
                                : null;
                        } catch (err) {
                            // A 404 means no invoice exists yet.
                            // Do not show an error toast for that case.
                            if (
                                err?.status !== 404 &&
                                err?.response?.status !== 404
                            ) {
                                console.error(
                                    `Failed to load invoice for job card ${jobCardId}:`,
                                    err
                                );
                            }

                            return null;
                        }
                    })
                );

                if (!cancelled) {
                    setGeneratedInvoices(
                        Object.fromEntries(results.filter(Boolean))
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    toast.error(
                        typeof err === "string"
                            ? err
                            : err?.message || "Failed to fetch job cards."
                    );
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    const filteredJobCards = useMemo(() => {
        const value = search.trim().toLowerCase();

        return jobCards.filter((jobCard) => {
            const id = String(getJobCardId(jobCard) ?? "").toLowerCase();
            const customer = String(getCustomerName(jobCard)).toLowerCase();
            const vehicle = String(getVehicleNumber(jobCard)).toLowerCase();
            const status = getStatus(jobCard);

            return (
                (!value ||
                    id.includes(value) ||
                    customer.includes(value) ||
                    vehicle.includes(value)) &&
                (statusFilter === "ALL" || status === statusFilter)
            );
        });
    }, [jobCards, search, statusFilter]);

    const handleStatusChange = async (jobCard, newStatus) => {
        const currentStatus = getStatus(jobCard);
        const id = getJobCardId(jobCard);

        if (
            currentStatus === "COMPLETED" ||
            currentStatus === "CANCELLED"
        ) {
            return;
        }

        if (!id || !newStatus || newStatus === currentStatus) return;

        try {
            await dispatch(
                updateJobCardStatus({ id, status: newStatus })
            ).unwrap();

            toast.success("Job Card status updated.");

            dispatch(fetchJobCards())
                .unwrap()
                .catch((err) =>
                    console.error("Failed to refresh job cards:", err)
                );
        } catch (err) {
            toast.error(
                typeof err === "string"
                    ? err
                    : err?.message || "Failed to update job card status."
            );
        }
    };

    const handleGenerateInvoice = async (jobCardId) => {
        if (!jobCardId || generatingInvoiceId !== null) return;

        setGeneratingInvoiceId(jobCardId);

        try {
            const response = await dispatch(
                generateInvoice(jobCardId)
            ).unwrap();

            const data = response?.data ?? response;

            const invoice = {
                ...data,
                id:
                    data?.id ??
                    data?.invoiceId ??
                    data?.invoice_id,
            };

            if (invoice.id == null) {
                console.error("Invoice ID missing from response:", response);
                toast.warning(
                    "Invoice generated, but the invoice ID was not returned."
                );
                return;
            }

            setGeneratedInvoices((previous) => ({
                ...previous,
                [jobCardId]: invoice,
            }));

            toast.success("Invoice generated successfully!");
        } catch (err) {
            console.error("INVOICE GENERATION ERROR:", err);

            const message =
                typeof err === "string"
                    ? err
                    : err?.message || err?.data?.message || "";

            if (
                String(message).toLowerCase().includes("already exists") ||
                String(message).includes("409")
            ) {
                // An invoice exists. Try loading it instead of generating again.
                try {
                    const response = await dispatch(
                        fetchInvoiceByJobCardId(jobCardId)
                    ).unwrap();

                    const data = response?.data ?? response;

                    const invoice = {
                        ...data,
                        id:
                            data?.id ??
                            data?.invoiceId ??
                            data?.invoice_id,
                    };

                    if (invoice.id != null) {
                        setGeneratedInvoices((previous) => ({
                            ...previous,
                            [jobCardId]: invoice,
                        }));

                        toast.info("Existing invoice loaded.");
                    } else {
                        toast.error("Existing invoice ID could not be found.");
                    }
                } catch (loadError) {
                    console.error("FAILED TO LOAD EXISTING INVOICE:", loadError);
                    toast.error(
                        "An invoice already exists, but it could not be loaded."
                    );
                }
            } else {
                toast.error(message || "Failed to generate invoice.");
            }
        } finally {
            setGeneratingInvoiceId(null);
        }
    };

    const handleViewInvoice = (jobCardId) => {
        const jobCard = jobCards.find(
            (item) =>
                String(getJobCardId(item)) === String(jobCardId)
        );

        const invoice =
            generatedInvoices[jobCardId] ?? jobCard?.invoice;

        const invoiceId =
            invoice?.id ??
            invoice?.invoiceId ??
            invoice?.invoice_id;

        if (invoiceId == null) {
            toast.error("Invoice details could not be found.");
            return;
        }

        if (typeof onViewInvoice !== "function") {
            toast.error("The View Invoice action is not connected.");
            return;
        }

        onViewInvoice(invoiceId);
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
                Loading job cards...
            </div>
        );
    }

    if (error && jobCards.length === 0) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                {typeof error === "string"
                    ? error
                    : error?.message || "Failed to load job cards."}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row md:items-center md:justify-between">
                <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by customer or vehicle..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 md:max-w-md"
                />

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {filteredJobCards.length === 0 ? (
                <div className="rounded-xl border bg-white p-10 text-center">
                    <p className="text-sm text-gray-500">
                        No job cards found.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border bg-white">
                    <div className="hidden grid-cols-6 gap-4 border-b bg-gray-50 px-5 py-3 text-xs font-semibold uppercase text-gray-500 md:grid">
                        <span>No.</span>
                        <span>Customer</span>
                        <span>Vehicle</span>
                        <span>Status / Invoice</span>
                        <span>View</span>
                        <span>Edit</span>
                    </div>

                    <div className="divide-y">
                        {filteredJobCards.map((jobCard, index) => {
                            const id = getJobCardId(jobCard);
                            const status = getStatus(jobCard);

                            const isLocked =
                                status === "COMPLETED" ||
                                status === "CANCELLED";

                            const isUpdating =
                                isStatusUpdating &&
                                String(statusUpdatingId) === String(id);

                            const invoice =
                                generatedInvoices[id] ?? jobCard.invoice;

                            const invoiceId =
                                invoice?.id ??
                                invoice?.invoiceId ??
                                invoice?.invoice_id;

                            const hasInvoice = invoiceId != null;

                            const isGenerating =
                                String(generatingInvoiceId) === String(id);

                            return (
                                <div
                                    key={id ?? index}
                                    className="grid gap-4 px-5 py-4 md:grid-cols-6 md:items-center"
                                >
                                    <div>
                                        <span className="text-xs text-gray-400 md:hidden">
                                            No.
                                        </span>
                                        <p className="font-medium text-gray-800">
                                            {index + 1}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-xs text-gray-400 md:hidden">
                                            Customer
                                        </span>
                                        <p className="font-medium text-gray-800">
                                            {getCustomerName(jobCard)}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-xs text-gray-400 md:hidden">
                                            Vehicle
                                        </span>
                                        <p className="text-sm text-gray-700">
                                            {getVehicleNumber(jobCard)}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-xs text-gray-400 md:hidden">
                                            {status === "COMPLETED"
                                                ? "Invoice"
                                                : "Status"}
                                        </span>

                                        {status === "COMPLETED" ? (
                                            hasInvoice ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewInvoice(id)
                                                    }
                                                    className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 md:w-auto"
                                                >
                                                    View Invoice
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isGenerating}
                                                    onClick={() =>
                                                        handleGenerateInvoice(id)
                                                    }
                                                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                                                >
                                                    {isGenerating
                                                        ? "Generating..."
                                                        : "Generate Invoice"}
                                                </button>
                                            )
                                        ) : (
                                            <select
                                                value={status}
                                                disabled={isLocked || isUpdating}
                                                onChange={(event) =>
                                                    handleStatusChange(
                                                        jobCard,
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 md:w-auto"
                                            >
                                                <option value="PENDING">
                                                    Pending
                                                </option>
                                                <option value="IN_PROGRESS">
                                                    In Progress
                                                </option>
                                                <option value="COMPLETED">
                                                    Completed
                                                </option>
                                                <option value="CANCELLED">
                                                    Cancelled
                                                </option>
                                            </select>
                                        )}
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => onView?.(id)}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:w-auto"
                                        >
                                            View
                                        </button>
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            disabled={isLocked}
                                            onClick={() => onEdit?.(id)}
                                            className={`w-full rounded-lg px-4 py-2 text-sm font-medium md:w-auto ${
                                                isLocked
                                                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobCardLists;