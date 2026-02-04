import React from "react";
import "./cartItem.css";

const CartItem = ({ cartItem11, onItemRemoved }) => {
    const { cart_product_id, item_name, quantity, price_per_unit, item_url } = cartItem11;

    const handleRemove = () => {
        console.log("Removing item with cart_product_id:", cart_product_id); // Debug log
        if (!cart_product_id) {
            console.error("Error: cart_product_id is undefined!");
            return;
        }

        if (window.confirm("Are you sure you want to remove this item?")) {
            onItemRemoved(cart_product_id);
        }
    };

    return (
        <div className="cart-item-card">
            <img src={item_url} alt={item_name} className="item-image" />
            <div className="item-info">
                <h3 className="item-title">{item_name}</h3>
                <div className="item-meta">
                    <p className="item-quantity">Quantity: {quantity}</p>
                    <p className="item-price">₹{price_per_unit}/unit</p>
                </div>
            </div>
            <button 
                onClick={handleRemove}
                className="remove-btn"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="trash-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Remove
            </button>
        </div>
    );
};

export default CartItem;