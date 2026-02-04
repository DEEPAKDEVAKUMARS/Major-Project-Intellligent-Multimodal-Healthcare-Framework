// MenuforCitizens.js (updated)
import { Component } from "react";
import { withRouter } from "../FRONTLOGINSIGNUP/withRouter";
import DisplayMenu from "../RATIONITEMS/DisplayMenu";
import "./displayStock.css";

class MenuforCitizens extends Component {
    state = {
        stockItems: [],
        userData: JSON.parse(localStorage.getItem("userData")) || null,
    };

    async componentDidMount() {
        if (!this.state.userData) {
            alert("Please login to access the menu");
            this.props.navigate("/login");
            return;
        }
        await this.fetchStockData();
        this.setStarAnimations();
    }

    fetchStockData = async () => {
        try {
            const response = await fetch("http://localhost:5000/vendorstockmanagement");
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const data = await response.json();
            this.setState({ stockItems: data });
            
        } catch (error) {
            console.error("Error fetching stock data:", error);
            alert("Failed to load menu items");
        }
    };

    setStarAnimations = () => {
        const stars = document.querySelectorAll('.star');
        const randomRange = (min, max) => min + Math.random() * (max - min);
        
        stars.forEach((star, index) => {
            star.style.setProperty('--star-tail-length', `${randomRange(8, 12)}em`);
            star.style.setProperty('--top-offset', `${randomRange(0, 100)}vh`);
            star.style.setProperty('--fall-duration', `${randomRange(4, 8)}s`);
            star.style.setProperty('--fall-delay', `${randomRange(0, 4)}s`);
        });
    };

    render() {
        const { userData, stockItems } = this.state;

        return (
            <>
                <div className="stars-container">
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className="star" 
                             style={{ '--star-color': `hsl(${Math.random() * 360}, 80%, 80%)` }} />
                    ))}
                </div>
                
                <div className="content-wrapper">
                    <h1 className="heady">Available Products</h1>
                    
                    {userData && (
                        <div className="user-greeting">
                            <span>Welcome, {userData.name}</span>
                            <button 
                                className="view-cart-btn"
                                onClick={() => this.props.navigate(`/cartproduct/${userData.user_id}`)}
                            >
                                View Your Cart
                            </button>
                        </div>
                    )}

                    <ul className="img-card">
                        {stockItems.length > 0 ? (
                            stockItems.map((item) => (
                                <DisplayMenu
                                    key={item.item_id}
                                    stockDetails={item}
                                />
                            ))
                        ) : (
                            <p className="no-items">No products available currently</p>
                        )}
                    </ul>
                </div>
            </>
        );
    }
}

export default withRouter(MenuforCitizens);