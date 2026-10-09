import React from "react";
import "./InvoiceView.css";

const InvoiceView = ({ invoice, onBack }) => {
  if (!invoice) {
    return <p>No invoice data available.</p>;
  }

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const services = invoice.services ?? invoice.serviceItems ?? [];
  const parts = invoice.parts ?? invoice.partsItems ?? [];

  const serviceTotal = services.reduce(
    (sum, item) =>
      sum +
      Number(
        item.totalPrice ??
          item.totalCost ??
          item.amount ??
          (Number(item.quantity ?? 1) *
            Number(item.unitPrice ?? item.price ?? 0))
      ),
    0
  );

  const partsTotal = parts.reduce(
    (sum, item) =>
      sum +
      Number(
        item.totalPrice ??
          item.totalCost ??
          item.amount ??
          (Number(item.quantity ?? 1) *
            Number(item.unitPrice ?? item.price ?? 0))
      ),
    0
  );

  const subtotal = Number(
    invoice.subtotal ?? invoice.subTotal ?? serviceTotal + partsTotal
  );

  const tax = Number(
    invoice.taxAmount ?? invoice.tax ?? invoice.gstAmount ?? 0
  );

  const grandTotal = Number(
    invoice.grandTotal ??
      invoice.totalAmount ??
      invoice.total ??
      subtotal + tax
  );

  const invoiceNumber =
    invoice.invoiceNumber ?? invoice.invoiceNo ?? invoice.id ?? "N/A";

  const customerName =
    invoice.customerName ?? invoice.customer?.name ?? "N/A";

  const customerPhone =
    invoice.customerPhone ?? invoice.customer?.phone ?? "N/A";

  const vehicleName =
    invoice.vehicleName ?? invoice.vehicle?.model ?? "N/A";

  const registrationNumber =
    invoice.registrationNumber ??
    invoice.vehicle?.registrationNumber ??
    "N/A";

  const invoiceDate = invoice.invoiceDate ?? invoice.createdAt;

  const renderItems = (items, type) => (
    <tbody>
      {items.length > 0 ? (
        items.map((item, index) => {
          const quantity = Number(item.quantity ?? 1);
          const rate = Number(
            item.unitPrice ?? item.price ?? item.cost ?? 0
          );
          const amount = Number(
            item.totalPrice ??
              item.totalCost ??
              item.amount ??
              quantity * rate
          );

          return (
            <tr key={item.id ?? index}>
              <td>{index + 1}</td>
              <td>
                {type === "service"
                  ? item.serviceName ??
                    item.name ??
                    item.description ??
                    "Service"
                  : item.partName ??
                    item.name ??
                    item.description ??
                    "Spare part"}
              </td>
              <td>{quantity}</td>
              <td>{formatCurrency(rate)}</td>
              <td className="amount-column">
                {formatCurrency(amount)}
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="5" className="invoice-empty">
            No items available
          </td>
        </tr>
      )}
    </tbody>
  );

  return (
    <div className="invoice-page">
      <div className="invoice-toolbar">
        <button
          type="button"
          className="invoice-back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <button
          type="button"
          className="invoice-print-btn"
          onClick={() => window.print()}
        >
          Print / Save PDF
        </button>
      </div>

      <div className="invoice-paper">
        <header className="invoice-header">
          <div>
            <h1>Ramnath Automobiles</h1>
            <p>Ramnath Automobiles,bijlinagar-Rd,chinhcwad,Pune</p>
            <p>9890136559</p>
          </div>

          <div className="invoice-heading">
            <h2>INVOICE</h2>
            <p>
              <strong>Invoice No:</strong> {invoiceNumber}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {invoiceDate
                ? new Date(invoiceDate).toLocaleDateString("en-IN")
                : "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {invoice.paymentStatus ?? invoice.status ?? "Pending"}
            </p>
          </div>
        </header>

        <div className="invoice-divider" />

        <section className="invoice-details">
          <div>
            <h3>Bill To</h3>
            <p>{customerName}</p>
            <p>Phone: {customerPhone}</p>
          </div>

          <div>
            <h3>Vehicle Details</h3>
            <p>{vehicleName}</p>
            <p>Registration: {registrationNumber}</p>
          </div>
        </section>

        <section className="invoice-items">
          <h3>Services</h3>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th className="amount-column">Amount</th>
              </tr>
            </thead>

            {renderItems(services, "service")}
          </table>
        </section>

        <section className="invoice-items">
          <h3>Spare Parts</h3>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th className="amount-column">Amount</th>
              </tr>
            </thead>

            {renderItems(parts, "part")}
          </table>
        </section>

        <section className="invoice-totals">
          <div>
            <span>Services Total</span>
            <span>{formatCurrency(serviceTotal)}</span>
          </div>

          <div>
            <span>Spare Parts Total</span>
            <span>{formatCurrency(partsTotal)}</span>
          </div>

          <div>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div>
            <span>Tax / GST</span>
            <span>{formatCurrency(tax)}</span>
          </div>

          <div className="invoice-grand-total">
            <strong>Grand Total</strong>
            <strong>{formatCurrency(grandTotal)}</strong>
          </div>
        </section>

        <footer className="invoice-footer">
          <p>Thank you for choosing our garage!</p>
          <p>This is a computer-generated invoice.</p>
        </footer>
      </div>
    </div>
  );
};

export default InvoiceView;