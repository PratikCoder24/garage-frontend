import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchJobCards,
    updateJobCardStatus,
} from "../../features/jobcard/JobCardSlice";

const JobCardLists = ({ onView, onEdit }) => {
    const dispatch = useDispatch();

    const {
        jobCards = [],
        isLoading,
        error,
    } = useSelector((state) => state.jobcards);

    useEffect(() => {
        dispatch(fetchJobCards());
    }, [dispatch]);

    const handleStatusChange = async (id, status) => {
        try {
            await dispatch(
                updateJobCardStatus({
                    id,
                    status,
                })
            ).unwrap();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            case "IN_PROGRESS":
                return "bg-blue-100 text-blue-700";

            case "COMPLETED":
                return "bg-green-100 text-green-700";

            case "CANCELLED":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const getCustomerName = (jobCard) => {
        return (
            jobCard.customer?.name ??
            jobCard.customerName ??
            jobCard.customer?.customerName ??
            "Unknown Customer"
        );
    };

    const getVehicleName = (jobCard) => {
        return (
            jobCard.vehicle?.vehicleNumber ??
            jobCard.vehicleNumber ??
            jobCard.vehicle?.registrationNumber ??
            "—"
        );
    };

    const getTotal = (jobCard) => {
        return Number(
            jobCard.estimatedCost ??
                jobCard.totalAmount ??
                jobCard.total ??
                0
        );
    };

    if (isLoading && jobCards.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-500">
                    Loading job cards...
                </p>
            </div>
        );
    }

    if (error && jobCards.length === 0) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full">

            {/* HEADER */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Job Cards
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage all repair job cards
                    </p>
                </div>

                <div className="text-sm text-gray-500">
                    Total:{" "}
                    <span className="font-semibold text-gray-800">
                        {jobCards.length}
                    </span>
                </div>
            </div>

            {/* EMPTY STATE */}
            {jobCards.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
                    <div className="text-4xl">
                        🔧
                    </div>

                    <h3 className="mt-3 font-semibold text-gray-800">
                        No Job Cards
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Create your first job card to get started.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

                    {/* DESKTOP TABLE */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left">

                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Job Card
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Customer
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Vehicle
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Estimate
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {jobCards.map((jobCard) => (
                                    <tr
                                        key={jobCard.id}
                                        className="hover:bg-gray-50"
                                    >

                                        {/* JOB CARD */}
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-800">
                                                #
                                                {jobCard.id}
                                            </p>

                                            {jobCard.createdAt && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {new Date(
                                                        jobCard.createdAt
                                                    ).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>

                                        {/* CUSTOMER */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-gray-800">
                                                {getCustomerName(
                                                    jobCard
                                                )}
                                            </p>
                                        </td>

                                        {/* VEHICLE */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-gray-600">
                                                {getVehicleName(
                                                    jobCard
                                                )}
                                            </p>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-5 py-4">
                                            <select
                                                value={
                                                    jobCard.status ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        jobCard.id,
                                                        e.target.value
                                                    )
                                                }
                                                className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none ${getStatusClass(
                                                    jobCard.status
                                                )}`}
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
                                        </td>

                                        {/* ESTIMATE */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-gray-800">
                                                ₹
                                                {getTotal(
                                                    jobCard
                                                ).toFixed(2)}
                                            </p>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onView?.(
                                                            jobCard
                                                        )
                                                    }
                                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                                >
                                                    View
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onEdit?.(
                                                            jobCard
                                                        )
                                                    }
                                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="divide-y divide-gray-100 md:hidden">

                        {jobCards.map((jobCard) => (
                            <div
                                key={jobCard.id}
                                className="p-4"
                            >

                                <div className="flex items-start justify-between">

                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            Job Card #
                                            {jobCard.id}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {getCustomerName(
                                                jobCard
                                            )}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                            jobCard.status
                                        )}`}
                                    >
                                        {jobCard.status ??
                                            "Unknown"}
                                    </span>

                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Vehicle
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                            {getVehicleName(
                                                jobCard
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Estimate
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-800">
                                            ₹
                                            {getTotal(
                                                jobCard
                                            ).toFixed(2)}
                                        </p>
                                    </div>

                                </div>

                                <div className="mt-4 flex gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onView?.(
                                                jobCard
                                            )
                                        }
                                        className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600"
                                    >
                                        View
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onEdit?.(
                                                jobCard
                                            )
                                        }
                                        className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white"
                                    >
                                        Edit
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                </div>
            )}

        </div>
    );
};

export default JobCardLists;