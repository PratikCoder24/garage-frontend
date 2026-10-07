import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    fetchJobCards,
    updateJobCardStatus,
} from "../../features/jobcard/JobCardSlice";

const JobCardLists = ({ onView, onEdit }) => {
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

    useEffect(() => {
        dispatch(fetchJobCards())
            .unwrap()
            .catch((error) => {
                toast.error(
                    typeof error === "string"
                        ? error
                        : error?.message ||
                              "Failed to fetch job cards."
                );
            });
    }, [dispatch]);

    const getJobCardId = (jobCard) =>
        jobCard?.id ?? jobCard?.jobCardId;

    const getCustomerName = (jobCard) =>
        jobCard?.customerName ?? "-";

    const getVehicleNumber = (jobCard) =>
        jobCard?.vehicleNumber ?? "-";

    const getStatus = (jobCard) =>
        String(jobCard?.status ?? "PENDING").toUpperCase();

    const filteredJobCards = useMemo(() => {
        const value = search.trim().toLowerCase();

        return jobCards.filter((jobCard) => {
            const id = String(
                getJobCardId(jobCard) ?? ""
            ).toLowerCase();

            const customer = String(
                getCustomerName(jobCard)
            ).toLowerCase();

            const vehicle = String(
                getVehicleNumber(jobCard)
            ).toLowerCase();

            const status = getStatus(jobCard);

            return (
                (!value ||
                    id.includes(value) ||
                    customer.includes(value) ||
                    vehicle.includes(value)) &&
                (statusFilter === "ALL" ||
                    status === statusFilter)
            );
        });
    }, [jobCards, search, statusFilter]);

    const handleStatusChange = async (
        jobCard,
        newStatus
    ) => {
        const currentStatus = getStatus(jobCard);
        const id = getJobCardId(jobCard);

        if (
            currentStatus === "COMPLETED" ||
            currentStatus === "CANCELLED"
        ) {
            return;
        }

        if (!id || !newStatus || newStatus === currentStatus) {
            return;
        }

        try {
            await dispatch(
                updateJobCardStatus({
                    id,
                    status: newStatus,
                })
            ).unwrap();

            toast.success("Job Card status updated.");
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                          error ||
                          "Failed to update job card status."
            );
        }
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
                    : error?.message ||
                      "Failed to load job cards."}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row md:items-center md:justify-between">
                <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search by customer or vehicle..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 md:max-w-md"
                />

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
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
                        <span>Status</span>
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
                                String(statusUpdatingId) ===
                                    String(id);

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
                                            Status
                                        </span>

                                        <select
                                            value={status}
                                            disabled={
                                                isLocked ||
                                                isUpdating
                                            }
                                            onChange={(event) =>
                                                handleStatusChange(
                                                    jobCard,
                                                    event.target.value
                                                )
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none md:w-auto ${
                                                isLocked ||
                                                isUpdating
                                                    ? "cursor-not-allowed bg-gray-100 text-gray-500"
                                                    : "border-gray-200 bg-white focus:border-blue-500"
                                            }`}
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
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onView?.(id)
                                            }
                                            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:w-auto"
                                        >
                                            View
                                        </button>
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            disabled={isLocked}
                                            onClick={() =>
                                                onEdit?.(id)
                                            }
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