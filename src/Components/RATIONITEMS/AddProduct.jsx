import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./addProduct.css";

const AddProduct = () => {
  const [productData, setProductData] = useState({
    item_name: "",
    available_quantity: "",
    unit: "",
    price_per_unit: "",
    item_url: "",
  });

  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/addProduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Product added successfully!");
        navigate("/vendorstockmanagement"); // Redirect to stock management page
      } else {
        alert(`Error: ${data.message || "Failed to add product"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="add-product-form">
      <form className="formboy" onSubmit={handleSubmit}>
        <h2 className="heady123">ENTER PRODUCT DETAILS</h2>
        <input
          type="text"
          name="item_name"
          placeholder="Item Name"
          className="inputADDproduct"
          value={productData.item_name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="available_quantity"
          placeholder="Quantity"
          value={productData.available_quantity}
          className="inputADDproduct"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="unit"
          placeholder="Unit (kg/liters)"
          value={productData.unit}
          className="inputADDproduct"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price_per_unit"
          placeholder="Price Per Unit"
          value={productData.price_per_unit}
          className="inputADDproduct"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="item_url"
          placeholder="Image URL"
          value={productData.item_url}
          className="inputADDproduct"
          onChange={handleChange}
          required
        />
        <button className="btn1100" type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;