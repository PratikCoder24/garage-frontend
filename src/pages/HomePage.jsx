import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchJobCards } from "../features/jobcard/JobCardSlice";
import { fetchInvoiceByJobCardId } from "../features/invoice/InvoiceReducer";

const WORKSHOP_NAME = "Ramnath Automobiles";
const RECENT_LIMIT = 5;

/* ---------- tiny inline icons (easy to swap for RN icons later) ---------- */
const Icon = ({ name, className = "h-5 w-5" }) => {
    const paths = {
        plus: "M12 5v14M5 12h14",
        wrench:
            "M14.7 6.3a4 4 0 0 0 5 5L21 12.6l-8.4 8.4a2.1 2.1 0 0 1-3-3L18 9.6 14.7 6.3zM14 5l-3-3-3 3 3 3",
        car: "M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16M3 16h18v3H3zM7 19v1.5M17 19v1.5",
        doc: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
        users:
            "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.3M15.5 4.2a3.5 3.5 0 0 1 0 6.6",
        bell: "M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6zM10 19a2 2 0 0 0 4 0",
        search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.5-4.5",
        clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
        scan: "M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16",
        tag: "M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01",
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d={paths[name]} />
        </svg>
    );
};

/* ---------- status styling ---------- */
const STATUS_STYLES = {
    PENDING: {
        label: "Pending",
        className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    IN_PROGRESS: {
        label: "In Progress",
        className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    COMPLETED: {
        label: "Completed",
        className: "border-green-200 bg-green-50 text-green-700",
    },
    CANCELLED: {
        label: "Cancelled",
        className: "border-red-200 bg-red-50 text-red-600",
    },
};

const getJobCardId = (jobCard) => jobCard?.id ?? jobCard?.jobCardId;
const getStatus = (jobCard) =>
    String(jobCard?.status ?? "PENDING").toUpperCase();

const getDescription = (jobCard) => {
    const names = (jobCard?.services || [])
        .map((s) => s?.serviceName)
        .filter(Boolean);

    if (names.length > 0) return names.join(" & ");
    return jobCard?.conditionNotes || "No services added yet";
};

/* ---------- small building blocks ---------- */
const StatCard = ({ title, value, hint, hintClass, icon, iconClass }) => (
    <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-gray-500">{title}</p>
            <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
            >
                <Icon name={icon} className="h-5 w-5" />
            </span>
        </div>

        <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
        <p className={`mt-1 text-xs ${hintClass}`}>{hint}</p>
    </div>
);

const QuickAction = ({ label, icon, iconClass, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-2"
    >
        <span
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
        >
            <Icon name={icon} className="h-6 w-6" />
        </span>
        <span className="text-xs font-medium text-gray-700">{label}</span>
    </button>
);

const RecentJobCard = ({
    jobCard,
    onView,
    onEdit,
    onViewInvoice,
    isOpeningInvoice,
}) => {
    const id = getJobCardId(jobCard);
    const status = getStatus(jobCard);
    const style = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
    const isLocked = status === "COMPLETED" || status === "CANCELLED";

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                        {jobCard?.customerName ?? "-"}
                    </p>

                    <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                        {jobCard?.vehicleNumber ?? "-"}
                    </span>
                </div>

                <span
                    className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${style.className}`}
                >
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    {style.label}
                </span>
            </div>

            <p className="mt-3 truncate text-sm text-gray-600">
                {getDescription(jobCard)}
            </p>

            <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                {status === "COMPLETED" && (
                    <button
                        type="button"
                        disabled={isOpeningInvoice}
                        onClick={() => onViewInvoice(id)}
                        className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                    >
                        {isOpeningInvoice ? "Opening..." : "View Invoice"}
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => onView(id)}
                    className={`rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 ${
                        status === "COMPLETED" ? "" : "flex-1"
                    }`}
                >
                    View
                </button>

                <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => onEdit(id)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        isLocked
                            ? "cursor-not-allowed bg-gray-100 text-gray-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } ${status === "COMPLETED" ? "" : "flex-1"}`}
                >
                    Edit
                </button>
            </div>
        </div>
    );
};

/* ---------- bottom navigation ---------- */
const NAV_ITEMS = [
    { label: "Home", icon: "wrench", path: "/" },
    { label: "Job Cards", icon: "doc", path: "/jobcards" },
    { label: "Vehicles", icon: "car", path: "/vehicles" },
    // No Account page exists yet, so Catalogue sits here for now.
    { label: "Catalogue", icon: "tag", path: "/catalogue" },
];

const BottomNav = ({ onCreate }) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const renderItem = (item) => {
        const active = pathname === item.path;

        return (
            <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] ${
                    active ? "text-blue-600" : "text-gray-500"
                }`}
            >
                <Icon name={item.icon} className="h-6 w-6" />
                {item.label}
            </button>
        );
    };

    return (
        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-gray-100 bg-white">
            <div className="relative flex items-end px-2 pb-1">
                {renderItem(NAV_ITEMS[0])}
                {renderItem(NAV_ITEMS[1])}

                <div className="flex flex-1 justify-center">
                    <button
                        type="button"
                        onClick={onCreate}
                        aria-label="Create job card"
                        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-white hover:bg-blue-700"
                    >
                        <Icon name="plus" className="h-7 w-7" />
                    </button>
                </div>

                {renderItem(NAV_ITEMS[2])}
                {renderItem(NAV_ITEMS[3])}
            </div>
        </nav>
    );
};

/* ---------- page ---------- */
const HomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { jobCards = [], isLoading } = useSelector(
        (state) => state.jobcards
    );

    const [search, setSearch] = useState("");
    const [openingInvoiceId, setOpeningInvoiceId] = useState(null);

    useEffect(() => {
        dispatch(fetchJobCards());
    }, [dispatch]);

    const stats = useMemo(() => {
        const count = (status) =>
            jobCards.filter((card) => getStatus(card) === status).length;

        return {
            inProgress: count("IN_PROGRESS"),
            pending: count("PENDING"),
            completed: count("COMPLETED"),
        };
    }, [jobCards]);

    const recentJobCards = useMemo(() => {
        const value = search.trim().toLowerCase();

        return [...jobCards]
            .sort(
                (a, b) =>
                    Number(getJobCardId(b) ?? 0) -
                    Number(getJobCardId(a) ?? 0)
            )
            .filter((card) => {
                if (!value) return true;

                return (
                    String(card?.customerName ?? "")
                        .toLowerCase()
                        .includes(value) ||
                    String(card?.vehicleNumber ?? "")
                        .toLowerCase()
                        .includes(value)
                );
            })
            .slice(0, RECENT_LIMIT);
    }, [jobCards, search]);

    const goCreate = () =>
        navigate("/jobcards", { state: { openCreate: true } });

    const goView = (id) => navigate("/jobcards", { state: { viewId: id } });

    const goEdit = (id) => navigate("/jobcards", { state: { editId: id } });

    const goInvoice = async (jobCardId) => {
        if (openingInvoiceId !== null) return;
        setOpeningInvoiceId(jobCardId);

        try {
            const response = await dispatch(
                fetchInvoiceByJobCardId(jobCardId)
            ).unwrap();

            const data = response?.data ?? response;
            const invoiceId = data?.id ?? data?.invoiceId ?? data?.invoice_id;

            if (invoiceId == null) throw new Error("No invoice id");

            navigate("/jobcards", { state: { invoiceId } });
        } catch {
            toast.info(
                "No invoice yet. Generate it from the Job Cards page."
            );
            navigate("/jobcards");
        } finally {
            setOpeningInvoiceId(null);
        }
    };

    return (
        <div className="mx-auto min-h-screen max-w-md bg-gray-100 pb-28">
            <div className="flex flex-col gap-4 p-4">
                {/* header + search */}
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            {WORKSHOP_NAME.split(" ")
                                .map((word) => word[0])
                                .slice(0, 2)
                                .join("")}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h1 className="truncate font-semibold text-gray-900">
                                {WORKSHOP_NAME}
                            </h1>
                            <p className="text-xs text-gray-500">
                                Workshop Operational Dashboard
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/jobcards")}
                            aria-label="Open job cards"
                            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600"
                        >
                            <Icon name="bell" />
                            {stats.pending > 0 && (
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                            )}
                        </button>
                    </div>

                    <div className="relative mt-4">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Icon name="search" className="h-4 w-4" />
                        </span>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by customer or vehicle..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* primary action */}
                <button
                    type="button"
                    onClick={goCreate}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                    <Icon name="plus" />
                    Create Job Card
                </button>

                {/* stats */}
                <div className="flex gap-3">
                    <StatCard
                        title="Active Jobs"
                        value={stats.inProgress}
                        hint={`${stats.pending} pending`}
                        hintClass="text-blue-600"
                        icon="wrench"
                        iconClass="bg-blue-50 text-blue-600"
                    />

                    <StatCard
                        title="Ready for Delivery"
                        value={stats.completed}
                        hint="Completed jobs"
                        hintClass="text-green-600"
                        icon="car"
                        iconClass="bg-green-50 text-green-600"
                    />
                </div>

                {/* quick actions */}
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Quick Actions
                    </p>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                        <QuickAction
                            label="New Card"
                            icon="plus"
                            iconClass="bg-blue-50 text-blue-600"
                            onClick={goCreate}
                        />
                        <QuickAction
                            label="Scan Plate"
                            icon="scan"
                            iconClass="bg-purple-50 text-purple-600"
                            // TODO: open camera / plate scanner in React Native.
                            onClick={() => navigate("/vehicles")}
                        />
                        <QuickAction
                            label="Billing"
                            icon="doc"
                            iconClass="bg-green-50 text-green-600"
                            onClick={() => navigate("/jobcards")}
                        />
                        <QuickAction
                            label="Customers"
                            icon="users"
                            iconClass="bg-orange-50 text-orange-500"
                            onClick={() => navigate("/customers")}
                        />
                    </div>
                </div>

                {/* recent job cards */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">
                            Recent Job Cards
                        </h2>

                        <button
                            type="button"
                            onClick={() => navigate("/jobcards")}
                            className="text-sm font-medium text-blue-600"
                        >
                            View All ({jobCards.length})
                        </button>
                    </div>

                    {isLoading && jobCards.length === 0 ? (
                        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
                            Loading job cards...
                        </div>
                    ) : recentJobCards.length === 0 ? (
                        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
                            {search
                                ? "No matching job cards."
                                : "No job cards yet. Tap + to create one."}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {recentJobCards.map((jobCard, index) => (
                                <RecentJobCard
                                    key={getJobCardId(jobCard) ?? index}
                                    jobCard={jobCard}
                                    onView={goView}
                                    onEdit={goEdit}
                                    onViewInvoice={goInvoice}
                                    isOpeningInvoice={
                                        String(openingInvoiceId) ===
                                        String(getJobCardId(jobCard))
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BottomNav onCreate={goCreate} />
        </div>
    );
};

export default HomePage;
