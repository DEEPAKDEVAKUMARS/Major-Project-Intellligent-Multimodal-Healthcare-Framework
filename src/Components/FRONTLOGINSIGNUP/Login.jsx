import { Component } from 'react';
import { withRouter } from './withRouter';

class Login extends Component {
  state = {
    username: '',
    password: '',
    error: null
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: null });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhar_number: username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Verify backend response structure
      console.log("Backend response:", data);
      
      if (!data.user?.user_id) {
        throw new Error("Invalid user data received from server");
      }

      // Prepare user data for storage
      const userData = {
        user_id: data.user.user_id,
        name: data.user.name,
        user_type: data.user.user_type,
        
        address:data.user.address,
        aadhar_number:data.user.aadhar_number
      };

      // Save to localStorage
      localStorage.setItem("userData", JSON.stringify(userData));
      console.log("User data saved to localStorage:", userData);

      // Verify storage
      const storedData = JSON.parse(localStorage.getItem("userData"));
      console.log("Verified localStorage data:", storedData);

      // Redirect based on user type
      this.props.navigate(data.user.user_type === "official" 
        ? "/vendorhomepage" 
        : "/homepage");

    } catch (error) {
      console.error("Login error:", error);
      this.setState({ error: error.message });
    }
  };

  render() {
    const { username, password, error } = this.state;

    return (
      <div className='main-Con'>
        <div className='small-Con'>
          <h1 className='heady-Home mb-5'>LOGIN PAGE</h1>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={this.handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Enter Aadhar Number"
              value={username}
              onChange={this.handleChange}
              className="form-control mb-3"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={password}
              onChange={this.handleChange}
              className="form-control mb-3"
              required
            />
            <button type="submit" className='btn-Home2'>Submit</button>
          </form>

          <p className="mt-3">
            Don't have an account?  
            <span onClick={() => this.props.navigate('/signup')} style={{ cursor: 'pointer', color: 'red' }}>
              Sign Up
            </span>
          </p>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);