import CustomerLists from "../components/customer/CustomerLists";

const CustomerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your garage customers</p>
        </div>
        <CustomerLists />
      </div>
    </div>
  );
};

export default CustomerPage;