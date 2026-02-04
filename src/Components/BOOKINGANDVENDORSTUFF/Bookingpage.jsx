import { useEffect, useState } from "react";
import { withRouter } from "../FRONTLOGINSIGNUP/withRouter";
import "./bookingpage.css"

const Bookingpage = ({ navigate }) => {
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [specialRequests, setSpecialRequests] = useState("");
  const [userData, setUserData] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    const storedGrandTotal = localStorage.getItem("grandTotal");

    if (storedUserData) {
      setUserData(storedUserData);
    }

    if (storedGrandTotal) {
      setGrandTotal(parseFloat(storedGrandTotal));
    }
  }, []);

  useEffect(() => {
    const isValid =
      userData?.user_id &&
      userData?.name &&
      userData?.address &&
      grandTotal > 0 &&
      deliveryMethod &&
      paymentMethod;
    setIsFormValid(isValid);
  }, [userData, grandTotal, deliveryMethod, paymentMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("Booking placed successfully!");
      
      
    
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError("");

    try {
      const cartId = JSON.parse(localStorage.getItem("cart_id")); // match the exact key


      const response = await fetch(
        `http://localhost:5000/createBooking/${userData.user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart_id: cartId,
            name: userData.name,
            address: userData.address,
            total_cost: grandTotal,
            aadhar_number: userData.aadhar_number,
            delivery_method: deliveryMethod,
            payment_method: paymentMethod,
            special_requests: specialRequests,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Booking failed");
      }

      alert("Booking placed successfully!");
      
      
      navigate(`/citizenorderpage/${userData.user_id}`);
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1 className="greeting">Hi {userData.name || "User"}</h1>
        
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <section className="form-section">
          <h2 className="section-title">Delivery Method</h2>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={() => setDeliveryMethod("delivery")}
              />
              <span className="radio-custom"></span>
              Delivery
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
              />
              <span className="radio-custom"></span>
              Pickup
            </label>
          </div>

          {deliveryMethod === "delivery" && (
            <div className="address-display">
              <p className="address-label">Delivery Address:</p>
              <p className="address-text">{userData.address || "No address available"}</p>
            </div>
          )}
        </section>

        <section className="form-section">
          <h2 className="section-title">Payment Method</h2>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              <span className="radio-custom"></span>
              Card Payment
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span className="radio-custom"></span>
              Cash on Delivery
            </label>
          </div>

          {paymentMethod === "card" && (
            <div className="card-details">
              <input
                type="text"
                placeholder="Card Number"
                required
                className="card-input"
              />
              <div className="card-input-group">
                <input
                  type="text"
                  placeholder="CVV"
                  required
                  className="card-input small"
                />
                <input
                  type="password"
                  placeholder="Card Password"
                  required
                  className="card-input small"
                />
              </div>
            </div>
          )}
        </section>

        <section className="form-section">
          <h2 className="section-title">Special Requests</h2>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any specific instructions or requests?"
            className="requests-textarea"
          />
        </section>

        <div className="total-section">
          <h2 className="total-text">Total Price: ₹{grandTotal.toFixed(2)}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? "Processing..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
};

export default withRouter(Bookingpage);
