import { useState } from "react";
import JobCardForm from "../components/jobcard/JobCardForm";
import JobCardLists from "../components/jobcard/JobCardLists";

const JobCardPage = () => {
    const [showForm, setShowForm] = useState(false);

    const handleView = (jobCard) => {
        console.log("View:", jobCard);
    };

    const handleEdit = (jobCard) => {
        console.log("Edit:", jobCard);
    };

    return (
        <div className="p-6">

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    Job Cards
                </h1>

                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Create Job Card
                </button>
            </div>

            <JobCardLists
                onView={handleView}
                onEdit={handleEdit}
            />

            <JobCardForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
            />

        </div>
    );
};

export default JobCardPage;