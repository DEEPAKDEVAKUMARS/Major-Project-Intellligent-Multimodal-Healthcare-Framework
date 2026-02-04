import { Component } from "react";
import { withRouter } from "../FRONTLOGINSIGNUP/withRouter";
import Displaystock from "../RATIONITEMS/Displaystock";
import "./displayStock.css"; // Original CSS preserved

class VendorStockManagement extends Component {
    state = {
        stockItems: [],
        userData: JSON.parse(localStorage.getItem("userData")) || null,
    };

    async componentDidMount() {
        if (!this.state.userData || this.state.userData.user_type !== "official") {
            this.props.navigate("/login");
            return;
        }
        this.fetchStockData();
    }

    fetchStockData = async () => {
        try {
            const response = await fetch("http://localhost:5000/vendorstockmanagement");
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            this.setState({ stockItems: data });
        } catch (error) {
            console.error("Error fetching stock data:", error);
            alert("Failed to load stock data");
        }
    };

    onStockChange = async (item_id, updatedQuantity) => {
        try {
            const response = await fetch("http://localhost:5000/updateStock", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id, available_quantity: updatedQuantity })
            });

            if (!response.ok) throw new Error("Update failed");
            
            this.setState(prevState => ({
                stockItems: prevState.stockItems.map(item =>
                    item.item_id === item_id ? { ...item, available_quantity: updatedQuantity } : item
                )
            }));
            alert(`Stock updated to ${updatedQuantity}`);
            
        } catch (error) {
            console.error("Update error:", error);
            alert("Error updating stock");
        }
    };

    render() {
        const { stockItems } = this.state;

        return (
            <div className="mainCon">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="heady">Stock Management</h1>
                    <div>
                        <button 
                            className="button1 mr-2" 
                            onClick={() => this.props.navigate("/vendorhomepage")}
                        >
                            Back
                        </button>
                        <button 
                            className="addProductBtn" 
                            onClick={() => this.props.navigate("/addproduct")}
                        >
                            Add Product+
                        </button>
                    </div>
                </div>

                <ul className="img-card">
                    {stockItems.length > 0 ? (
                        stockItems.map(eachItem => (
                            <Displaystock 
                                key={eachItem.item_id} 
                                stockDetails={eachItem} 
                                onStockChange={this.onStockChange} 
                            />
                        ))
                    ) : (
                        <p>No products available</p>
                    )}
                </ul>
            </div>
        );
    }
}

export default withRouter(VendorStockManagement);