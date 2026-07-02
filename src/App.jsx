import CustomerPage from "./pages/CustomerPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Toast from "./toast/Toast";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={"Home page"} />
          <Route path="/customers" element={<CustomerPage />} />
        </Routes>
      </div>
      <Toast />
    </Router>
  );
}

export default App;