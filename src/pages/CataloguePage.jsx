import CatalogueLists from "../components/catalogue/CatalogueLists";

const CataloguePage = () => {
    return (
        <div className="flex flex-col gap-6">

            <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                    Catalogue
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Manage your garage parts and services
                </p>
            </div>

            <CatalogueLists />

        </div>
    );
};

export default CataloguePage;