import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://talenthub-f7ef.onrender.com';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post(`${API_BASE}/auth/token/login/`, formData)
      .then(res => {
        const token = res.data.auth_token;
        localStorage.setItem('authToken', token);

        return axios.get(`${API_BASE}/auth/users/me/`, {
          headers: { Authorization: `Token ${token}` }
        });
      })
      .then(res => {
        const role = res.data.role;
        if (role === 'admin') navigate('/admin-landing');
        else if (role === 'employer') navigate('/employer-landing');
        else if (role === 'applicant') navigate('/applicant-landing');
        else navigate('/');
      })
      .catch(() => alert('Invalid credentials'));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary">Login</button>
        </form>
        <button
          className="btn-secondary"
          onClick={() => navigate('/signup')}
        >
          Register
        </button>
      </div>
    </div>
  );
}