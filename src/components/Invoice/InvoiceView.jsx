import React from "react";
import "./InvoiceView.css";

const InvoiceView = ({ invoice, onBack }) => {
  if (!invoice) {
    return <p>No invoice data available.</p>;
  }

  const formatCurrency = (amount) =>
    `₹${Number(amount ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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

  const grandTotal = Number(
    invoice.totalAmount ?? serviceTotal + partsTotal
  );

  const invoiceNumber =
    invoice.invoiceNumber ??
    invoice.invoiceNo ??
    invoice.invoiceId ??
    invoice.id ??
    "N/A";

  // Customer details must be supplied by the API or parent component.
  const customerName =
    invoice.customerName ?? invoice.customer?.name ?? "N/A";

  const customerPhone =
    invoice.customerPhone ?? invoice.customer?.phone ?? "N/A";

  const invoiceDate = invoice.invoiceDate ?? invoice.createdAt;

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
            <p>Ramnath Automobiles, Bijlinagar Road, Chinchwad, Pune</p>
            <p>9890136559</p>
          </div>

          <div className="invoice-heading">
            <h2>INVOICE</h2>

            <p>
              <strong>Invoice No:</strong> {invoiceNumber}
            </p>

            <p>
              <strong>Date:</strong> {formatDate(invoiceDate)}
            </p>
          </div>
        </header>

        <div className="invoice-divider" />

        <section className="invoice-details">
          <div>
            <h3>Bill To</h3>
            <p>{invoice.customerName || "N/A"}</p>
            <p>{invoice.customerPhone || "N/A"}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Vehicle Details</h3>
            <p>Registration: {invoice.vehicleNumber || "N/A"}</p>
            <p>Company: {invoice.vehicleCompany || "N/A"}</p>
            <p>Model: {invoice.vehicleModel || "N/A"}</p>
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

            <tbody>
              {services.length > 0 ? (
                services.map((item, index) => {
                  const quantity = Number(item.quantity ?? 1);
                  const rate = Number(
                    item.labourFee ?? item.defaultFee ?? 0
                  );
                  const amount = rate * quantity;

                  return (
                    <tr key={item.id ?? index}>
                      <td>{index + 1}</td>
                      <td>{item.serviceName ?? "Service"}</td>
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
                    No services available
                  </td>
                </tr>
              )}
            </tbody>
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

            <tbody>
              {parts.length > 0 ? (
                parts.map((item, index) => {
                  const quantity = Number(item.quantity ?? 1);
                  const rate = Number(
                    item.priceUsed ?? item.price ?? 0
                  );
                  const amount = quantity * rate;

                  return (
                    <tr key={item.id ?? index}>
                      <td>{index + 1}</td>
                      <td>{item.partName ?? "Spare part"}</td>
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
                    No spare parts available
                  </td>
                </tr>
              )}
            </tbody>
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

          <div className="invoice-grand-total">
            <strong>Grand Total</strong>
            <strong>{formatCurrency(grandTotal)}</strong>
          </div>
        </section>

        <footer className="invoice-footer">
          <p>Thank you for choosing our garage!</p>
        </footer>
      </div>
    </div>
  );
};

export default InvoiceView;