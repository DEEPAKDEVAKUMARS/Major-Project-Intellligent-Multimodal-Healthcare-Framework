import React, { Component } from "react";
import "./displayStock.css";

class DisplayMenu extends Component {
  state = {
    currentQuantity: this.props.stockDetails.available_quantity,
    productAddedCount: 0,
  };

  addBTn = () => {
    this.setState((prevState) => ({
      productAddedCount:
        prevState.productAddedCount < prevState.currentQuantity
          ? prevState.productAddedCount + 1
          : prevState.productAddedCount,
    }));
  };

  reduceBtn = () => {
    this.setState((prevState) => ({
      productAddedCount:
        prevState.productAddedCount > 0
          ? prevState.productAddedCount - 1
          : 0,
    }));
  };

  addToCart = async () => {
    const { stockDetails } = this.props;
    const { productAddedCount } = this.state;
  
    if (productAddedCount === 0) {
      alert("Please add at least one item to the cart.");
      return;
    }
  
    try {
      // ✅ Get user data from local storage
      const storedData = localStorage.getItem("userData");
      if (!storedData) {
        alert("User not logged in. Please login again.");
        return;
      }
  
      const userData = JSON.parse(storedData);
      if (!userData || !userData.user_id) {
        alert("User ID is missing. Please login again.");
        return;
      }
  
      // Send POST request to server
      const response = await fetch("http://localhost:5000/addToCart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userData.user_id,  // Correctly fetched user_id
          item_id: stockDetails.item_id,
          quantity: productAddedCount,
          price_per_unit: stockDetails.price_per_unit
        })
      });
  
      const responseData = await response.json();
      console.log("Server Response:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add item to cart");
      }
  
      alert("Item added to cart successfully!");
      this.setState({ productAddedCount: 0 });
  
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert(error.message);
    }
  };
  
  

  render() {
    const { stockDetails } = this.props;
    const { item_name, unit, price_per_unit, item_url } = stockDetails;
    const { currentQuantity, productAddedCount } = this.state;
  
    return (
      <li className="product-card">
        <div className="product-image-container">
          <img src={item_url} className="product-image" alt={item_name} />
          <div className="availability-badge">
            {currentQuantity} {unit} left
          </div>
        </div>
        
        <div className="product-details">
          <h2 className="product-title">{item_name}</h2>
          <p className="price-per-unit">₹{price_per_unit}<span>/{unit}</span></p>
          
          <div className="quantity-controls">
            <button
              type="button"
              onClick={this.reduceBtn}
              className="quantity-btn minus"
            >
              −
            </button>
            <span className="quantity-display">{productAddedCount}</span>
            <button
              type="button"
              onClick={this.addBTn}
              className="quantity-btn plus"
            >
              +
            </button>
          </div>
          
          <button
            type="button"
            className="add-to-cart-btn"
            onClick={this.addToCart}
          >
            <svg className="cart-icon" viewBox="0 0 24 24">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            Add to Cart
          </button>
        </div>
      </li>
    );
  }
}

export default DisplayMenu;