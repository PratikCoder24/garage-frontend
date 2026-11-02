import React from "react";

const formatCurrency = (amount) =>
    `₹${Number(amount ?? 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (date) => {
    if (!date) return "N/A";

    // Handles dates in DD-MM-YYYY format.
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        const [day, month, year] = date.split("-");
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        ).toLocaleDateString("en-IN");
    }

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
        ? date
        : parsedDate.toLocaleDateString("en-IN");
};

/* One line item as a compact row instead of a wide table (fits a phone). */
const ItemRow = ({ index, name, quantity, rate }) => (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2.5 last:border-b-0">
        <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800">
                {index + 1}. {name}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
                {quantity} × {formatCurrency(rate)}
            </p>
        </div>

        <p className="shrink-0 text-sm font-semibold text-gray-900">
            {formatCurrency(quantity * rate)}
        </p>
    </div>
);

const Section = ({ title, empty, children, hasItems }) => (
    <section className="mt-5">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {title}
        </h3>

        {hasItems ? (
            children
        ) : (
            <p className="rounded-lg border border-dashed p-3 text-center text-sm text-gray-400">
                {empty}
            </p>
        )}
    </section>
);

const InvoiceView = ({ invoice, onBack }) => {
    if (!invoice) {
        return <p className="p-4 text-sm text-gray-500">No invoice data available.</p>;
    }

    const services = invoice.services ?? [];
    const parts = invoice.parts ?? [];

    const serviceTotal = Number(
        invoice.labourCost ??
            services.reduce(
                (sum, item) =>
                    sum + Number(item.labourFee ?? item.defaultFee ?? 0),
                0
            )
    );

    const partsTotal = Number(
        invoice.partsCost ??
            parts.reduce(
                (sum, item) =>
                    sum +
                    Number(item.quantity ?? 1) *
                        Number(item.priceUsed ?? item.price ?? 0),
                0
            )
    );

    const grandTotal = Number(invoice.totalAmount ?? serviceTotal + partsTotal);

    const invoiceNumber =
        invoice.invoiceNumber ??
        invoice.invoiceNo ??
        invoice.invoiceId ??
        invoice.id ??
        "N/A";

    const customerName =
        invoice.customerName ?? invoice.customer?.name ?? "N/A";

    const customerPhone =
        invoice.customerPhone ?? invoice.customer?.phone ?? "N/A";

    const invoiceDate = invoice.invoiceDate ?? invoice.createdAt;

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white">
            {/* top bar (hidden when printing) */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 print:hidden">
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-lg px-2 py-1.5 text-sm font-medium text-blue-600"
                >
                    ← Back
                </button>

                <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                    Print / Save PDF
                </button>
            </div>

            <div className="mx-auto max-w-md p-4 pb-10 sm:max-w-2xl print:max-w-none print:p-0">
                <div className="rounded-2xl bg-white p-4 shadow-sm print:rounded-none print:shadow-none">
                    {/* header */}
                    <header className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-gray-900">
                                Ramnath Automobiles
                            </h1>
                            <p className="mt-1 text-xs text-gray-500">
                                Bijlinagar Road, Chinchwad, Pune
                            </p>
                            <p className="text-xs text-gray-500">9890136559</p>
                        </div>

                        <div className="shrink-0 text-right">
                            <h2 className="text-base font-bold tracking-wide text-blue-600">
                                INVOICE
                            </h2>
                            <p className="mt-1 text-xs text-gray-600">
                                <span className="font-semibold">No:</span>{" "}
                                {invoiceNumber}
                            </p>
                            <p className="text-xs text-gray-600">
                                <span className="font-semibold">Date:</span>{" "}
                                {formatDate(invoiceDate)}
                            </p>
                        </div>
                    </header>

                    <div className="my-4 border-t border-gray-200" />

                    {/* bill to + vehicle */}
                    <section className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Bill To
                            </h3>
                            <p className="mt-1 text-sm font-medium text-gray-800">
                                {customerName}
                            </p>
                            <p className="text-xs text-gray-500">{customerPhone}</p>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Vehicle
                            </h3>
                            <p className="mt-1 font-mono text-sm font-medium text-gray-800">
                                {invoice.vehicleNumber || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {[invoice.vehicleCompany, invoice.vehicleModel]
                                    .filter(Boolean)
                                    .join(" ") || "N/A"}
                            </p>
                        </div>
                    </section>

                    {/* services */}
                    <Section
                        title="Services"
                        empty="No services available"
                        hasItems={services.length > 0}
                    >
                        {services.map((item, index) => (
                            <ItemRow
                                key={item.id ?? index}
                                index={index}
                                name={item.serviceName ?? "Service"}
                                quantity={Number(item.quantity ?? 1)}
                                rate={Number(item.labourFee ?? item.defaultFee ?? 0)}
                            />
                        ))}
                    </Section>

                    {/* spare parts */}
                    <Section
                        title="Spare Parts"
                        empty="No spare parts available"
                        hasItems={parts.length > 0}
                    >
                        {parts.map((item, index) => (
                            <ItemRow
                                key={item.id ?? index}
                                index={index}
                                name={item.partName ?? "Spare part"}
                                quantity={Number(item.quantity ?? 1)}
                                rate={Number(item.priceUsed ?? item.price ?? 0)}
                            />
                        ))}
                    </Section>

                    {/* totals */}
                    <section className="mt-5 space-y-1.5 rounded-xl bg-gray-50 p-4 text-sm print:bg-white">
                        <div className="flex justify-between text-gray-600">
                            <span>Services Total</span>
                            <span>{formatCurrency(serviceTotal)}</span>
                        </div>

                        <div className="flex justify-between text-gray-600">
                            <span>Spare Parts Total</span>
                            <span>{formatCurrency(partsTotal)}</span>
                        </div>

                        <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                            <span>Grand Total</span>
                            <span>{formatCurrency(grandTotal)}</span>
                        </div>
                    </section>

                    <footer className="mt-5 text-center text-xs text-gray-400">
                        Thank you for choosing our garage!
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default InvoiceView;