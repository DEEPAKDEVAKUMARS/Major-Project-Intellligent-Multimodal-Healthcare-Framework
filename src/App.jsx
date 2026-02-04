import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Front from "./Components/FRONTLOGINSIGNUP/Front.jsx";
import Login from "./Components/FRONTLOGINSIGNUP/Login.jsx";
import Signup from "./Components/FRONTLOGINSIGNUP/Signup.jsx";
import Homepage from "./Components/HOMEPAGE/Homepage.jsx";
import VendorHomepage from "./Components/HOMEPAGE/VendorHomepage.jsx";
import VendorStockManagement from "./Components/RATIONITEMS/VendorStockManagement.jsx";
import AddProduct from "./Components/RATIONITEMS/AddProduct.jsx";
import MenuforCitizens from "./Components/RATIONITEMS/MenuforCitizens.jsx";
import CartProduct from "./Components/RATIONITEMS/CartProduct.jsx";
import Bookingpage from "./Components/BOOKINGANDVENDORSTUFF/Bookingpage.jsx"
import VendorOrderConfirmation from "./Components/BOOKINGANDVENDORSTUFF/VendorOrderConfirmation.jsx";
import MindMate from "./Components/CHATBOT/MindMate.jsx";
import AppointmentFinder from "./Components/APPOINTMENT/AppointmentFinder.jsx";
import OphthalmologistFinder from "./Components/APPOINTMENT/OphthalmologistFinder.jsx";
import CitizenOrderPage from "./Components/ORDERSANDSTUFF/CitizenOrderPage.jsx";

const ProtectedRoute = ({ children }) => {
  // Retrieve and validate userData
  const rawData = localStorage.getItem("userData");
  console.log("Checking authentication, Raw userData:", rawData);

  if (!rawData) {
    console.warn("No userData found - redirecting to login");
    return <Navigate to="/login" replace />;
  }

  try {
    const userData = JSON.parse(rawData);
    console.log("Parsed userData:", userData);

    if (!userData?.user_id) {
      console.warn("Invalid userData structure - redirecting");
      return <Navigate to="/login" replace />;
    }

    // Allow access to protected routes
    return children;
  } catch (error) {
    console.error("Error parsing userData:", error);
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Front />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/homepage" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
        <Route path="/menuforcitizens" element={<ProtectedRoute><MenuforCitizens /></ProtectedRoute>} />
        <Route path="/cartproduct/:user_id" element={<ProtectedRoute><CartProduct /></ProtectedRoute>} />
        <Route path="/bookingpage/:user_id" element={<ProtectedRoute><Bookingpage /></ProtectedRoute>} />
        <Route path="/mindmate" element={<ProtectedRoute><MindMate /></ProtectedRoute>} />
        <Route path="/appointmentfinder" element={<ProtectedRoute><AppointmentFinder /></ProtectedRoute>} />
        <Route path="/ophthalmologistfinder" element={<ProtectedRoute><OphthalmologistFinder /></ProtectedRoute>} />
        <Route path="/citizenorderpage/:user_id" element={<ProtectedRoute><CitizenOrderPage /></ProtectedRoute>}/>

        {/* Vendor-Specific Routes */}
        <Route path="/vendorhomepage" element={<ProtectedRoute><VendorHomepage /></ProtectedRoute>} />
        <Route path="/vendorstockmanagement" element={<ProtectedRoute><VendorStockManagement /></ProtectedRoute>} />
        <Route path="/addproduct" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/vendororderconfirmation" element={<ProtectedRoute><VendorOrderConfirmation /></ProtectedRoute>} />
        

        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
