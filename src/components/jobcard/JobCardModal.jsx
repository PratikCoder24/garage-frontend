import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    fetchJobCardById,
    clearSelectedJobCard,
} from "../../features/jobcard/JobCardSlice";

const Field = ({ label, children }) => (
    <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-800">{children}</p>
    </div>
);

const JobCardModal = ({ jobCardId, isOpen, onClose }) => {
    const dispatch = useDispatch();

    const { selectedJobCard, isLoadingSelectedJobCard, error } = useSelector(
        (state) => state.jobcards
    );

    useEffect(() => {
        if (!isOpen || !jobCardId) {
            return;
        }

        dispatch(fetchJobCardById(jobCardId))
            .unwrap()
            .catch((error) => {
                toast.error(
                    typeof error === "string"
                        ? error
                        : error?.message || "Failed to load job card."
                );
            });

        return () => {
            dispatch(clearSelectedJobCard());
        };
    }, [isOpen, jobCardId, dispatch]);

    if (!isOpen) {
        return null;
    }

    const services = Array.isArray(selectedJobCard?.services)
        ? selectedJobCard.services
        : [];

    const parts = Array.isArray(selectedJobCard?.parts)
        ? selectedJobCard.parts
        : [];

    const servicesTotal = Number(selectedJobCard?.estimate ?? 0);
    const partsTotal = Number(selectedJobCard?.partsTotal ?? 0);
    const grandTotal = Number(
        selectedJobCard?.grandTotal ?? servicesTotal + partsTotal
    );

    return (
        // Bottom sheet on phones, centred card on larger screens.
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
            <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
                {/* header */}
                <div className="flex shrink-0 items-start justify-between border-b px-4 py-3">
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-gray-900">
                            Job Card #{selectedJobCard?.id ?? jobCardId}
                        </h2>
                        <p className="truncate text-sm text-gray-500">
                            {selectedJobCard?.customerName || "-"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl leading-none text-gray-500"
                    >
                        ×
                    </button>
                </div>

                {/* body */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoadingSelectedJobCard && (
                        <div className="py-10 text-center text-sm text-gray-500">
                            Loading job card...
                        </div>
                    )}

                    {error && !isLoadingSelectedJobCard && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                            {typeof error === "string"
                                ? error
                                : error?.message || "Failed to load job card."}
                        </div>
                    )}

                    {selectedJobCard && !isLoadingSelectedJobCard && (
                        <div className="space-y-5">
                            {/* details */}
                            <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
                                <Field label="Customer">
                                    {selectedJobCard.customerName || "-"}
                                </Field>
                                <Field label="Vehicle">
                                    {selectedJobCard.vehicleNumber || "-"}
                                </Field>
                                <Field label="Status">
                                    {selectedJobCard.status || "-"}
                                </Field>
                                <Field label="Created">
                                    {selectedJobCard.createdAt || "-"}
                                </Field>
                                <Field label="Delivery Date">
                                    {selectedJobCard.deliveryDate || "-"}
                                </Field>

                                <div className="col-span-2">
                                    <p className="text-xs text-gray-400">
                                        Condition Notes
                                    </p>
                                    <p className="mt-0.5 text-sm text-gray-700">
                                        {selectedJobCard.conditionNotes || "None"}
                                    </p>
                                </div>
                            </div>

                            {/* services */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">
                                        Services
                                    </h3>
                                    <span className="text-sm font-semibold text-gray-700">
                                        ₹{servicesTotal.toFixed(2)}
                                    </span>
                                </div>

                                {services.length === 0 ? (
                                    <div className="rounded-xl border border-dashed p-4 text-sm text-gray-400">
                                        No services
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {services.map((service, index) => (
                                            <div
                                                key={service?.id ?? index}
                                                className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                                            >
                                                <p className="text-sm font-medium text-gray-700">
                                                    {service?.serviceName || "-"}
                                                </p>
                                                <span className="shrink-0 text-sm font-semibold text-gray-800">
                                                    ₹
                                                    {Number(service?.labourFee ?? 0).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* parts */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">
                                        Parts
                                    </h3>
                                    <span className="text-sm font-semibold text-gray-700">
                                        ₹{partsTotal.toFixed(2)}
                                    </span>
                                </div>

                                {parts.length === 0 ? (
                                    <div className="rounded-xl border border-dashed p-4 text-sm text-gray-400">
                                        No parts
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {parts.map((part, index) => {
                                            const quantity = Number(part?.quantity ?? 1);
                                            const price = Number(part?.priceUsed ?? 0);
                                            const total = quantity * price;

                                            return (
                                                <div
                                                    key={part?.id ?? index}
                                                    className="rounded-xl border px-4 py-3"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-sm font-medium text-gray-700">
                                                            {part?.partName || "-"}
                                                        </p>
                                                        <p className="shrink-0 text-sm font-semibold text-gray-800">
                                                            ₹{total.toFixed(2)}
                                                        </p>
                                                    </div>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {quantity} × ₹{price.toFixed(2)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* grand total */}
                            <div className="flex items-center justify-between border-t pt-4">
                                <span className="text-base font-semibold text-gray-800">
                                    Grand Total
                                </span>
                                <span className="text-2xl font-bold text-blue-600">
                                    ₹{grandTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* footer */}
                <div className="shrink-0 border-t bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl border border-gray-200 py-3 font-medium text-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobCardModal;