import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    fetchJobCardById,
    clearSelectedJobCard,
} from "../../features/jobcard/JobCardSlice";

const JobCardModal = ({
    jobCardId,
    isOpen,
    onClose,
}) => {
    const dispatch = useDispatch();

    const {
        selectedJobCard,
        isLoadingSelectedJobCard,
        error,
    } = useSelector((state) => state.jobcards);

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
                        : error?.message ||
                              "Failed to load job card."
                );
            });

        return () => {
            dispatch(clearSelectedJobCard());
        };
    }, [isOpen, jobCardId, dispatch]);

    if (!isOpen) {
        return null;
    }

    const services = Array.isArray(
        selectedJobCard?.services
    )
        ? selectedJobCard.services
        : [];

    const parts = Array.isArray(
        selectedJobCard?.parts
    )
        ? selectedJobCard.parts
        : [];

    const servicesTotal = Number(
        selectedJobCard?.estimate ?? 0
    );

    const partsTotal = Number(
        selectedJobCard?.partsTotal ?? 0
    );

    const grandTotal = Number(
        selectedJobCard?.grandTotal ??
            servicesTotal + partsTotal
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Job Card #
                            {selectedJobCard?.id ??
                                jobCardId}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {selectedJobCard?.customerName ||
                                "-"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-2xl text-gray-400 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-6">
                    {isLoadingSelectedJobCard && (
                        <div className="py-10 text-center text-sm text-gray-500">
                            Loading job card...
                        </div>
                    )}

                    {error && !isLoadingSelectedJobCard && (
                        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                            {typeof error === "string"
                                ? error
                                : error?.message ||
                                  "Failed to load job card."}
                        </div>
                    )}

                    {selectedJobCard &&
                        !isLoadingSelectedJobCard && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-3">
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Customer
                                        </p>
                                        <p className="mt-1 font-medium text-gray-800">
                                            {selectedJobCard.customerName ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Vehicle
                                        </p>
                                        <p className="mt-1 font-medium text-gray-800">
                                            {selectedJobCard.vehicleNumber ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Status
                                        </p>
                                        <p className="mt-1 font-medium text-gray-800">
                                            {selectedJobCard.status ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Created Date
                                        </p>
                                        <p className="mt-1 font-medium text-gray-800">
                                            {selectedJobCard.createdAt ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Delivery Date
                                        </p>
                                        <p className="mt-1 font-medium text-gray-800">
                                            {selectedJobCard.deliveryDate ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div className="md:col-span-3">
                                        <p className="text-xs text-gray-400">
                                            Condition Notes
                                        </p>
                                        <p className="mt-1 text-sm text-gray-700">
                                            {selectedJobCard.conditionNotes ||
                                                "None"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">
                                            Services
                                        </h3>

                                        <span className="font-semibold text-gray-700">
                                            ₹
                                            {servicesTotal.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>

                                    {services.length ===
                                    0 ? (
                                        <div className="rounded-lg border border-dashed p-4 text-sm text-gray-400">
                                            No services
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {services.map(
                                                (
                                                    service,
                                                    index
                                                ) => (
                                                    <div
                                                        key={
                                                            service?.id ??
                                                            index
                                                        }
                                                        className="flex items-center justify-between rounded-lg border px-4 py-3"
                                                    >
                                                        <p className="text-sm font-medium text-gray-700">
                                                            {service?.serviceName ||
                                                                "-"}
                                                        </p>

                                                        <span className="text-sm font-semibold text-gray-800">
                                                            ₹
                                                            {Number(
                                                                service?.labourFee ??
                                                                    0
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">
                                            Parts
                                        </h3>

                                        <span className="font-semibold text-gray-700">
                                            ₹
                                            {partsTotal.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>

                                    {parts.length ===
                                    0 ? (
                                        <div className="rounded-lg border border-dashed p-4 text-sm text-gray-400">
                                            No parts
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {parts.map(
                                                (
                                                    part,
                                                    index
                                                ) => {
                                                    const quantity =
                                                        Number(
                                                            part?.quantity ??
                                                                1
                                                        );

                                                    const price =
                                                        Number(
                                                            part?.priceUsed ??
                                                                0
                                                        );

                                                    const total =
                                                        quantity *
                                                        price;

                                                    return (
                                                        <div
                                                            key={
                                                                part?.id ??
                                                                index
                                                            }
                                                            className="rounded-lg border px-4 py-3"
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="text-sm font-medium text-gray-700">
                                                                    {part?.partName ||
                                                                        "-"}
                                                                </p>

                                                                <p className="text-sm font-semibold text-gray-800">
                                                                    ₹
                                                                    {total.toFixed(
                                                                        2
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div className="mt-2 flex gap-5 text-xs text-gray-500">
                                                                <span>
                                                                    Qty:{" "}
                                                                    <strong className="text-gray-700">
                                                                        {
                                                                            quantity
                                                                        }
                                                                    </strong>
                                                                </span>

                                                                <span>
                                                                    Unit Price:{" "}
                                                                    <strong className="text-gray-700">
                                                                        ₹
                                                                        {price.toFixed(
                                                                            2
                                                                        )}
                                                                    </strong>
                                                                </span>

                                                                <span>
                                                                    Total:{" "}
                                                                    <strong className="text-gray-700">
                                                                        ₹
                                                                        {total.toFixed(
                                                                            2
                                                                        )}
                                                                    </strong>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold text-gray-800">
                                            Grand Total
                                        </span>

                                        <span className="text-2xl font-bold text-blue-600">
                                            ₹
                                            {grandTotal.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>

                <div className="flex justify-end border-t bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobCardModal;