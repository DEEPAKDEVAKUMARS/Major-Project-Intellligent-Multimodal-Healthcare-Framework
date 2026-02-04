import "./displayStock.css";
import { Component } from "react";


class Displaystock extends Component {
    state = {
        currentQuantity: this.props.stockDetails.available_quantity, // Initialize state
    };

    addBTn = () => {
        this.setState((prevState) => ({
            currentQuantity: prevState.currentQuantity + 10, 
        }));
    };

    reduceBtn = () => {
        this.setState((prevState) => ({
            currentQuantity: prevState.currentQuantity > 0 ? prevState.currentQuantity - 10 : 0, 
        }));
    };

    updateBtn = () => {
        const { stockDetails, onStockChange } = this.props;
        const { currentQuantity } = this.state;
    
        // Send only item_id and updated quantity to VendorStockManagement
        onStockChange(stockDetails.item_id, currentQuantity);
    };
    

    render() {
        const { stockDetails } = this.props;
        const { item_name, unit, price_per_unit, item_url } = stockDetails;
        const { currentQuantity } = this.state;

        return (
            <li className="cardOfImg">
                <img src={item_url} className="item-img" alt={item_name} />
                <h1 className="item-name">{item_name}</h1>
                <div className="btnCon">
                    <button type="button" onClick={this.reduceBtn} className="reduceStockBtn">-</button>
                    <button type="button" onClick={this.updateBtn} className="availableStockBtn">
                        {currentQuantity} {unit}
                    </button>
                    <button type="button" onClick={this.addBTn} className="increaseStockBtn">+</button>
                </div>
                <p className="item-Cost">{price_per_unit}/{unit}</p>
            </li>
        );
    }
}

export default Displaystock;