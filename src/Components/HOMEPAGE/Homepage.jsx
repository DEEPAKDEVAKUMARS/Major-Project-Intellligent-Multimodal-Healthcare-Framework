import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Homepage.css";

const Homepage = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = React.useState(false);
    const [userData, setUserData] = React.useState(null);

    useEffect(() => {
        const storedData = localStorage.getItem("userData");
        if (storedData) {
            setUserData(JSON.parse(storedData));
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleMenuClick = () => {
        navigate("/menuforcitizens"); // Kept your original navigation link
    };

    const handleLogout = () => {
        localStorage.removeItem("userData");
        navigate("/login");
    };

    const handleappointment=()=>{
        navigate("/appointmentfinder")
    }
    const handleCartClick=()=>{
        navigate(`/cartproduct/${userData.user_id}`)
    }

    const handleopthalmologistAI=()=>{
        window.location.href = '/ophthalmologistfinder';
    }

    const handleDiabeticRetinopathy=()=>{
        window.open('http://localhost:8501', '_blank');
    }

    return (
        <>
            {/* Navbar - Exactly as before, only text changes */}  
            
            <nav class="navbar navbar-expand-lg navbar-light bg34 fixed-top">
            <div class="container">
            <img src="https://media.istockphoto.com/id/1401811766/vector/a-cute-round-robot-wearing-a-stethoscope-new-technologies-and-lifestyle.jpg?s=612x612&w=0&k=20&c=KcnoJHezDoLSrUMXHpAP4KBjxMd2XECUHG0irdLyhmE="
                            className="logo1"
                            alt="Medical Logo" />
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav ml-auto">
                    <a class="boy nav-link " id="nav-li" href="#wcu-section">Why choose us?</a>
                    <button className=" boy nav-link btn btn-link" onClick={handleMenuClick}>
                                    Online Pharamacy
                                </button>
                    <button className=" boy nav-link btn btn-link" onClick={handleCartClick} >
                                    Your Cart
                    </button>
                    <button className=" boy nav-link btn btn-link" onClick={() => navigate(`/citizenorderpage/${userData.user_id}`)} >
                                    Your Orders
                    </button>
                    
                    {userData && (
                                    <>
                                        <span className="nav-link boy">Welcome, {userData.name}</span>
                                        <button className="nav-link boy btn btn-link" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </>
                                )}
                </div>
            </div>
        </div>
            </nav>
            {/* Main Content - Only text changes */}
            <div className="bg-con d-flex flex-column justify-content-center">
                <div className="text-center">
                    <h1 className="headmain mb-3">GENNEURO <span className="heart-beat">❤️</span> </h1>
                    <p className="paramain mb-4">Digital Healthcare Solutions</p>
                    {userData ? (
                        <div>
                            <div className="btn-divv">
                            
                                <div className="wrap">
                                    <button className="button1" onClick={() => window.open('/mindmate')}>Talk to AI Doctor</button>
                                </div>
                                <button className="button2" onClick={handleappointment}>
                                    Psychiatrists Near You
                                </button>
                                <button className="button1" onClick={handleopthalmologistAI}>
                                    Ophthalmologists Near You
                                </button>
                            </div>
                            <div className="mt-2">
                                <button className="button1" onClick={handleDiabeticRetinopathy}>Diabetic Detection</button>
                            </div>
                        </div>
                        
                    ) : (
                        <p>please login to access services.</p> 
                    )}
                </div>
            </div>

            {/* WCU Section - Only content changes */}
            <div className="wcu-section pt-5 pb-5" id="wcu-section">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="wcu-head">Why Choose Us?</h1>
                            <p className="wcu-para">
                                Comprehensive healthcare management with digital solutions for patients and providers.
                            </p>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="wcu-card p-3 mt-3">
                                <img 
                                    src="https://cdn-icons-png.flaticon.com/512/3050/3050155.png" 
                                    className="wcu-card-image" 
                                    alt="EHR" 
                                />
                                <h1 className="wcu-card-title mt-3">Electronic Records</h1>
                                <p className="wcu-card-desc">
                                    Secure digital storage for patient medical histories and treatment plans.
                                </p>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="wcu-card p-3 mt-3">
                                <img 
                                    src="https://cdn-icons-png.flaticon.com/512/5996/5996832.png" 
                                    className="wcu-card-image" 
                                    alt="Appointment" 
                                />
                                <h1 className="wcu-card-title mt-3">Appointments</h1>
                                <p className="wcu-card-desc">
                                    Easy scheduling system with real-time doctor availability.
                                </p>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="wcu-card p-3 mt-3">
                                <img 
                                    src="https://cdn-icons-png.flaticon.com/512/1067/1067555.png" 
                                    className="wcu-card-image" 
                                    alt="Pharmacy" 
                                />
                                <h1 className="wcu-card-title mt-3">Pharmacy</h1>
                                <p className="wcu-card-desc">
                                    Integrated prescription management with local pharmacies.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Section - Only content changes */}
            <div className="delivery-and-payment-section pt-5 pb-5" id="payment">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-md-5 order-1 order-md-2">
                            <div className="text-center">
                                <img 
                                    src="https://cdn-icons-png.flaticon.com/512/5996/5996941.png" 
                                    className="delivery-and-payment-section-img" 
                                    alt="Insurance" 
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-7 order-2 order-md-1">
                            <h1 className="delivery-and-payment-section-heading">
                                Insurance Processing
                            </h1>
                            <p className="delivery-and-payment-section-description">
                                Integrated insurance claim processing with major healthcare providers.
                            </p>
                            <button className="custom-button">Learn More</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Only content changes */}
            <div className="footer-section pt-5 pb-5">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center">
                            <img 
                                src="https://cdn-icons-png.flaticon.com/512/2906/2906274.png" 
                                className="food-munch-logo" 
                                alt="Medical Logo" 
                            />
                            <h1 className="footer-section-mail-id">contact@medmanagesystem.com</h1>
                            <p className="footer-section-address">
                                123 Health Street, Medical City
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Homepage;