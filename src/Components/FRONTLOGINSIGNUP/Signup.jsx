import { Component } from 'react';
import { withRouter } from './withRouter'; // For navigation support

class Signup extends Component {
  state = {
    name: '',
    aadhar_number: '',
    phone: '',
    address: '',
    family_members: '',
    user_type: '',
    gender: '',
    password: '',
    confirmPassword: '',
    acceptPolicy: false,
    error: '', // For displaying errors
    success: '' // For success messages
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleCheckboxChange = () => {
    this.setState((prevState) => ({ acceptPolicy: !prevState.acceptPolicy }));
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, aadhar_number, phone, address, family_members, user_type, gender, password, confirmPassword, acceptPolicy } = this.state;

    if (password !== confirmPassword) {
      this.setState({ error: "Passwords do not match!", success: "" });
      return;
    }

    if (!acceptPolicy) {
      this.setState({ error: "You must accept the policy!", success: "" });
      return;
    }

    // Send data to backend
    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, aadhar_number, phone, address, family_members, user_type, gender, password })
      });

      const data = await response.json();
      if (response.ok) {
        this.setState({ success: "Signup successful!", error: "" });
        setTimeout(() => this.props.navigate('/login'), 2000); // Redirect to login
      } else {
        this.setState({ error: data.error, success: "" });
      }
    } catch (err) {
      this.setState({ error: "Server error. Try again later.", success: "" });
    }
  };

  render() {
    return (
      <div className='main-Con'>
        <div className='small-Con2'>
          <h1 className='heady-Home mb-5'>SIGN UP</h1>

          {/* Error Message */}
          {this.state.error && <p style={{ color: "red" }}>{this.state.error}</p>}

          {/* Success Message */}
          {this.state.success && <p style={{ color: "green" }}>{this.state.success}</p>}

          <form onSubmit={this.handleSubmit}>
            <input type="text" name="name" placeholder="Enter Full Name" value={this.state.name} onChange={this.handleChange} className="form-control mb-3" required />
            <input type="text" name="aadhar_number" placeholder="Enter Aadhar Number" value={this.state.aadhar_number} onChange={this.handleChange} className="form-control mb-3" required />
            <input type="tel" name="phone" placeholder="Enter Phone Number" value={this.state.phone} onChange={this.handleChange} className="form-control mb-3" required />
            <input type="text" name="address" placeholder="Enter Address" value={this.state.address} onChange={this.handleChange} className="form-control mb-3" required />
            <input type="number" name="family_members" placeholder="Number of Family Members" value={this.state.family_members} onChange={this.handleChange} className="form-control mb-3" required />

            <select name="user_type" value={this.state.user_type} onChange={this.handleChange} className="form-control mb-3" required>
              <option value="">Select User Type</option>
              <option value="citizen">Citizen</option>
              <option value="volunteer">Volunteer</option>
              <option value="official">Government Official</option>
              <option value="admin">Admin</option>
            </select>

            <select name="gender" value={this.state.gender} onChange={this.handleChange} className="form-control mb-3" required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input type="password" name="password" placeholder="Enter Password" value={this.state.password} onChange={this.handleChange} className="form-control mb-3" required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={this.state.confirmPassword} onChange={this.handleChange} className="form-control mb-3" required />

            <div className="policy-container mb-3">
              <input type="checkbox" id="acceptPolicy" className="form-check-input" checked={this.state.acceptPolicy} onChange={this.handleCheckboxChange} />
              <label htmlFor="acceptPolicy" className="form-check-label">
                I accept the <span style={{ color: 'red', cursor: 'pointer' }}>policy</span>
              </label>
            </div>

            <button type="submit" className='btn-Home2' disabled={!this.state.acceptPolicy}>
              Register
            </button>
          </form>

          <p className="mt-3">
            Already have an account?  
            <span onClick={() => this.props.navigate('/login')} style={{ cursor: 'pointer', color: 'red' }}>Login</span>
          </p>
        </div>
      </div>
    );
  }
}

export default withRouter(Signup);