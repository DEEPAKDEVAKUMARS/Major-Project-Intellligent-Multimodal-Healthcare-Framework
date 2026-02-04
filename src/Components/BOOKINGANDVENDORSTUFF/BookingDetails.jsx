import React, { Component } from "react";
import "./bookingDetails.css";

class BookingDetails extends Component {
  state = {
    cartProducts: [],
    bookingInfo: null,
    orderInfo: null,
    pickupTime: "",
    secretCode: "",
    generating: false,
    confirming: false,
    isConfirmed: false,
    loadingOrder: true,
    error: null
  };

  componentDidMount() {
    this.initializeComponent();
  }

  componentDidUpdate(prevProps) {
    if (this.props.BookingDetails !== prevProps.BookingDetails) {
      this.initializeComponent();
    }
  }

  initializeComponent = () => {
    const { BookingDetails } = this.props;
    
    if (BookingDetails) {
      this.setState({ 
        bookingInfo: BookingDetails,
        isConfirmed: BookingDetails.confirmed === "YES",
        error: null
      }, () => {
        this.fetchCartProducts(BookingDetails.booking_id);
        this.fetchOrderDetails(BookingDetails.booking_id);
      });
    } else {
      this.setState({ error: "No booking info found" });
    }
  };

  fetchOrderDetails = async (booking_id) => {
    try {
      this.setState({ loadingOrder: true, error: null });
      const response = await fetch(`http://localhost:5000/orders/${booking_id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load order details");
      }

      const data = await response.json();
      this.setState({ 
        orderInfo: data,
        secretCode: data.secret_code || "",
        pickupTime: data.pickup_time || "",
        loadingOrder: false
      });

    } catch (error) {
      console.error("Error:", error);
      this.setState({ 
        loadingOrder: false,
        error: error.message
      });
    }
  };

  fetchCartProducts = async (booking_id) => {
    try {
      const response = await fetch(`http://localhost:5000/booking-details/${booking_id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load products");
      }
      const data = await response.json();
      this.setState({ cartProducts: data, error: null });

    } catch (error) {
      console.error("Error:", error);
      this.setState({ error: error.message });
    }
  };

  handleTimeChange = (e) => {
    this.setState({ pickupTime: e.target.value });
  };

  handleApiError = (error) => {
    console.error("API Error:", error);
    const message = error.message || "Operation failed. Please try again.";
    this.setState({ error: message });
    alert(message);
  };

  generateSecretCode = async (e) => {
    e.preventDefault();
    const { pickupTime, bookingInfo } = this.state;
    
    if (!pickupTime) {
      this.setState({ error: "Please select pickup time" });
      return;
    }
  
    try {
      this.setState({ generating: true, error: null });
      
      const secretCode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      
      const response = await fetch(
        `http://localhost:5000/orders/${bookingInfo.booking_id}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}` // Add auth if needed
          },
          body: JSON.stringify({
            pickup_time: new Date(pickupTime).toISOString(), // Ensure proper date format
            secret_code: secretCode
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Confirmation failed");
      }

      // Refresh data after successful update
      await Promise.all([
        this.fetchOrderDetails(bookingInfo.booking_id),
        this.fetchCartProducts(bookingInfo.booking_id)
      ]);

      this.setState({ 
        isConfirmed: true,
        secretCode,
        generating: false,
        bookingInfo: {
          ...this.state.bookingInfo,
          confirmed: "YES"
        }
      });

      alert("Order confirmed! Stock quantities updated successfully.");

    } catch (error) {
      this.handleApiError(error);
      this.setState({ generating: false });
    }
  };

  confirmDelivery = async () => {
    try {
      this.setState({ confirming: true, error: null });
      
      const response = await fetch(
        `http://localhost:5000/orders/${this.state.bookingInfo.booking_id}/confirm`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Confirmation failed");
      }

      // Refresh data after successful confirmation
      await Promise.all([
        this.fetchOrderDetails(this.state.bookingInfo.booking_id),
        this.fetchCartProducts(this.state.bookingInfo.booking_id)
      ]);

      this.setState({ 
        isConfirmed: true,
        confirming: false,
        bookingInfo: {
          ...this.state.bookingInfo,
          confirmed: "YES"
        }
      });

      alert("Delivery confirmed! Stock quantities updated successfully.");

    } catch (error) {
      this.handleApiError(error);
      this.setState({ confirming: false });
    }
  };

  render() {
    const { 
      cartProducts, 
      bookingInfo, 
      orderInfo, 
      pickupTime, 
      generating, 
      confirming, 
      isConfirmed,
      loadingOrder,
      error
    } = this.state;

    if (error) {
      return (
        <div className="main-co error-container">
          <div className="error-message">⚠️ {error}</div>
        </div>
      );
    }

    if (!bookingInfo) return null;

    return (
      <div className="main-co">
        <div className="booking-info">
          <h1 className="headoo">{bookingInfo.name}</h1>
          <div className="booking-meta">
            <p><strong>Booking ID:</strong> {bookingInfo.booking_id}</p>
            <p><strong>Total Cost:</strong> ₹{bookingInfo.total_cost}</p>
            
            <p><strong>Delivery Method:</strong> {bookingInfo.delivery_method}</p>
            <p><strong>Status:</strong> 
              <span className={isConfirmed ? "confirmed-status" : "pending-status"}>
                {isConfirmed ? "Confirmed ✓" : "Pending"}
              </span>
            </p>
            <p><strong>Payment:</strong> {bookingInfo.paid ? "Paid ✓" : "Pending"}</p>
          </div>

          {bookingInfo.delivery_method === "pickup" ? (
            <div className="pickup-section">
              {isConfirmed ? (
                <div className="confirmed-pickup">
                  <h3>Pickup Information</h3>
                  {loadingOrder ? (
                    <div className="loading">Loading pickup details...</div>
                  ) : (
                    <>
                      {orderInfo ? (
                        <div className="secret-code-display">
                          <p><strong>Secret Code:</strong> {orderInfo.secret_code}</p>
                          <p><strong>Scheduled Pickup:</strong> 
                            {orderInfo.pickup_time ? 
                              new Date(orderInfo.pickup_time).toLocaleString() : 
                              'Not scheduled'}
                          </p>
                        </div>
                      ) : (
                        <div className="no-info">No pickup information available</div>
                      )}
                      <p className="instructions">
                        Present this code at the collection center during the scheduled time
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={this.generateSecretCode}>
                  <label>
                    Select Pickup Date & Time:
                    <input
                      type="datetime-local"
                      value={pickupTime}
                      onChange={this.handleTimeChange}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </label>
                  <button 
                    type="submit" 
                    className={`confirm-button ${generating ? "generating" : ""}`}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <span className="spinner"></span>
                        Processing...
                      </>
                    ) : (
                      "Confirm & Generate Code"
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="delivery-section">
              {isConfirmed ? (
                <div className="confirmed-delivery">
                  <h3>Delivery Confirmation</h3>
                  <p>Order successfully delivered and confirmed</p>
                  {orderInfo?.confirmed_at && (
                    <p>Confirmed at: {new Date(orderInfo.confirmed_at).toLocaleString()}</p>
                  )}
                </div>
              ) : (
                <div className="delivery-confirm">
                  <button 
                    className={`confirm-button ${confirming ? "generating" : ""}`}
                    onClick={this.confirmDelivery}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <>
                        <span className="spinner"></span>
                        Confirming...
                      </>
                    ) : (
                      "Confirm Delivery"
                    )}
                  </button>
                  <p className="instructions">
                    Click to confirm delivery and update stock quantities
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="products-section">
          <h2>Ordered Items</h2>
          {cartProducts.length > 0 ? (
            <ul className="products-list">
              {cartProducts.map(item => (
                <li key={item.cart_product_id} className="product-item">
                  
                  <div className="product-details">
                    <h3>{item.item_name}</h3>
                    <p>Quantity: {item.quantity}</p>
                    <p>Total Price: ₹{item.total_price}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-products">No products found in this order</p>
          )}
        </div>
      </div>
    );
  }
}

export default BookingDetails;