import { useEffect, useState } from "react";
import { withRouter } from "../FRONTLOGINSIGNUP/withRouter";
import "./CitizenOrderPage.css";

const CitizenOrderPage = ({ navigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData?.user_id) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/orders/${userData.user_id}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Loading order history...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="citizen-order-container">
      <h1>Your Order History</h1>
      <button onClick={() => navigate("/homepage")} className="back-button">
        ← Back to Home
      </button>

      {orders.length === 0 ? (
        <div className="no-orders">No orders found</div>
      ) : (
        orders.map((order) => (
          <div key={order.order_id} className="order-card">
            <div className="order-header">
              <h2>Order made on {new Date(order.order_date).toLocaleDateString()}</h2>
              
            </div>

            <div className="order-details">
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total Amount:</strong> ₹{order.total_amount.toFixed(2)}</p>
              <p><strong>Delivery Method:</strong> {order.delivery_method}</p>
              <p><strong>Payment Status: {order.payment_status==="YES"?"PAID":"CASH ON Delivery"} </strong></p>
              {order.delivery_status==="YES"?<p><strong>Order Status:</strong>Confirmed</p>:<p><strong>Order Status:</strong> Waiting For Confirmation</p>}
              {order.delivery_method==="pickup"?
              <div>
                <p><strong>Pick up Date&Time:</strong> {order.pickup_time}</p>
                <p><strong>Secret Key:</strong> {order.secret_code}</p>
                <p>Note: <strong>Please Try to Come on Time</strong></p>
              </div>

              :<p></p>
              }
            </div>

            <div className="order-products">
              <h3>Products:</h3>
              {order.products.map((product) => (
                <div key={product.order_product_id} className="product-item">
                  <img 
                    src={product.item_url} 
                    alt={product.item_name} 
                    className="product-image-order"
                  />
                  <div className="product-info">
                    <h4>{product.item_name}</h4>
                    <p>Quantity: {product.quantity}</p>
                    <p>Price: ₹{product.price_per_unit.toFixed(2)}/unit</p>
                    <p>Total: ₹{product.total_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default withRouter(CitizenOrderPage);