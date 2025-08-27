import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'applicant' });
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post(`${API_BASE}/auth/users/`, formData)
      .then(() => {
        alert('Account created! Please log in.');
        navigate('/login');
      })
      .catch(err => {
        console.error(err);
        alert('Signup failed');
      });
  };

return (
  <div className="signup-container">
    <div className="signup-card">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <select name="role" onChange={handleChange}>
          <option value="applicant">Applicant</option>
          <option value="employer">Employer</option>
        </select>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  </div>
);

}