import { useState } from "react";
import { useDispatch } from "react-redux";

import JobCardForm from "../components/jobcard/JobCardForm";
import JobCardLists from "../components/jobcard/JobCardLists";
import JobCardModal from "../components/jobcard/JobCardModal";
import InvoiceView from "../components/Invoice/InvoiceView";

import { fetchInvoices } from "../features/invoice/InvoiceReducer";

const JobCardPage = () => {
    const dispatch = useDispatch();

    const [showForm, setShowForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedJobCardId, setSelectedJobCardId] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const handleView = (id) => {
        setSelectedJobCardId(id);
        setShowViewModal(true);
    };

    const handleEdit = (id) => {
        setSelectedJobCardId(id);
        setShowForm(true);
    };

    const handleViewInvoice = async (invoiceId) => {
        try {
            const result = await dispatch(
                fetchInvoices(invoiceId)
            ).unwrap();

            setSelectedInvoice(result);
        } catch (error) {
            console.error("Failed to load invoice:", error);
        }
    };

    const handleCreateNew = () => {
        setSelectedJobCardId(null);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedJobCardId(null);
    };

    const handleCloseModal = () => {
        setShowViewModal(false);
        setSelectedJobCardId(null);
    };

    return (
        <div className="p-4 md:p-6">
            {selectedInvoice ? (
                <InvoiceView
                    invoice={selectedInvoice}
                    onBack={() => setSelectedInvoice(null)}
                />
            ) : (
                <>
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Job Cards
                        </h1>

                        <button
                            type="button"
                            onClick={handleCreateNew}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            + Create Job Card
                        </button>
                    </div>

                    <JobCardLists
                        onView={handleView}
                        onEdit={handleEdit}
                        onViewInvoice={handleViewInvoice}
                    />
                </>
            )}

            {!selectedInvoice && (
                <>
                    <JobCardModal
                        jobCardId={selectedJobCardId}
                        isOpen={showViewModal}
                        onClose={handleCloseModal}
                    />

                    <JobCardForm
                        jobCardId={selectedJobCardId}
                        isOpen={showForm}
                        onClose={handleCloseForm}
                    />
                </>
            )}
        </div>
    );
};

export default JobCardPage;