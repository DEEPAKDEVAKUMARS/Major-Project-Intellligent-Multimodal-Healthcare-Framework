import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const VendorHomepage = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem("userData"));

    // Authentication check
    useEffect(() => {
        if (!userData || userData.user_type !== "official") {
            alert("Vendor access only. Please login with vendor credentials.");
            navigate("/login");
        }
    }, [navigate, userData]);

    const handleLogout = () => {
        localStorage.removeItem("userData");
        navigate("/login");
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <>
            {/* Vendor Navigation Bar */}
            <nav className="navbar navbar-expand-lg navbar-light bg34 fixed-top">
                <div className="container">
                    <div className="navbar-brand">
                        <img
                            src="https://i.pinimg.com/564x/37/2d/30/372d300ed089b345c2a8c9d03233e35d.jpg"
                            className="logo1"
                            alt="Ration System Logo"
                        />
                        <span className="ms-2 fw-bold">Vendor Portal</span>
                    </div>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#vendorNavbar"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="vendorNavbar">
                        <div className="navbar-nav ms-auto">
                            <button 
                                className="nav-link btn btn-link" 
                                onClick={() => handleNavigation("/vendorhomepage")}
                            >
                                Dashboard
                            </button>
                            <button 
                                className="nav-link btn btn-link" 
                                onClick={() => handleNavigation("/vendorstockmanagement")}
                            >
                                Manage Stock
                            </button>
                            <button 
                                className="nav-link btn btn-link" 
                                onClick={() => handleNavigation("/addproduct")}
                            >
                                Add Products
                            </button>
                            <button 
                                className="nav-link btn btn-link" 
                                onClick={() => handleNavigation("/vendororderconfirmation")}
                            >
                                Bookings List
                            </button>
                            {userData && (
                                <span className="nav-link text-dark">
                                    <i className="bi bi-person-circle me-1"></i>
                                    {userData.name}
                                </span>
                            )}
                            <button 
                                className="nav-link btn btn-link text-danger" 
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Dashboard */}
            <div className="vendor-dashboard">
                <div className="bg-con d-flex flex-column justify-content-center">
                    <div className="text-center">
                        <h1 className="headmain mb-3">Vendor Dashboard</h1>
                        <p className="paramain mb-4">Manage your ration inventory efficiently</p>
                        
                        <div className="dashboard-actions">
                            <button 
                                className="button1 me-3"
                                onClick={() => handleNavigation("/vendorstockmanagement")}
                            >
                                <i className="bi bi-box-seam me-2"></i>
                                View Stock
                            </button>
                            <button 
                                className="button2"
                                onClick={() => handleNavigation("/addproduct")}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Add New Product
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Section */}
                <div className="container mt-5">
                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="stat-card">
                                <h3>Total Products</h3>
                                <p className="stat-value">24</p>
                                <small>In inventory</small>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="stat-card">
                                <h3>Low Stock</h3>
                                <p className="stat-value text-warning">5</p>
                                <small>Need restocking</small>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="stat-card">
                                <h3>Today's Orders</h3>
                                <p className="stat-value text-success">12</p>
                                <small>To be fulfilled</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="container mt-4 mb-5">
                    <h2 className="section-title mb-4">
                        <i className="bi bi-clock-history me-2"></i>
                        Recent Activity
                    </h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon bg-primary">
                                <i className="bi bi-plus-lg"></i>
                            </div>
                            <div className="activity-content">
                                <p>Added 10kg Rice to inventory</p>
                                <small>10 minutes ago</small>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon bg-success">
                                <i className="bi bi-arrow-repeat"></i>
                            </div>
                            <div className="activity-content">
                                <p>Updated wheat flour stock to 25kg</p>
                                <small>1 hour ago</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="footer-section pt-4 pb-3 bg-light">
                <div className="container text-center">
                    <p className="mb-2">
                        <img 
                            src="https://i.pinimg.com/564x/37/2d/30/372d300ed089b345c2a8c9d03233e35d.jpg" 
                            width="40" 
                            alt="Logo" 
                            className="me-2"
                        />
                        Ration Management System
                    </p>
                    <p className="small text-muted">
                        © {new Date().getFullYear()} Developed for Government Ration System
                    </p>
                </div>
            </footer>
        </>
    );
};

export default VendorHomepage;