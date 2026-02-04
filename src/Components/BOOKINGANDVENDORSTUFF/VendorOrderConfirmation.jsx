import { Component } from "react";
import { withRouter } from "../FRONTLOGINSIGNUP/withRouter";

import BookingDetails from "./BookingDetails";

class VendorOrderConfirmation extends Component {
    state = {
        bookingItems: [],
        userData: JSON.parse(localStorage.getItem("userData")) || null, // ✅ Added userData
    };

    async componentDidMount() {
        if (!this.state.userData || this.state.userData.user_type !== "official") {
            alert("Access Denied. Please login as an official.");
            this.props.navigate("/login");
            return;
        }
        this.fetchBookingData();
    }

    fetchBookingData = async () => {
        try {
            const response = await fetch("http://localhost:5000/vendorBookingData");
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const data = await response.json();
            this.setState({ bookingItems: data });
        } catch (error) {
            console.error("Error fetching booking data:", error);
            alert("Failed to load booking data");
        }
    };

    render() {
        const { bookingItems } = this.state; // ✅ Correctly accessed bookingItems

        return (
            <div>
                <h1>Booking List of Customers</h1>
                <ul className="img-card">
                    {bookingItems.length > 0 ? (
                        bookingItems.map(eachItem => (
                            <BookingDetails
                                key={eachItem.booking_id}
                                BookingDetails={eachItem}
                            />
                        ))
                    ) : (
                        <p>No Bookings Available</p>
                    )}
                </ul>
            </div>
        );
    }
}

export default withRouter(VendorOrderConfirmation);
