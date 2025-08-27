import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://talenthub-f7ef.onrender.com/api';

export default function ProtectedRoute({ children, allowedRole }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return setStatus('unauthorized');

    axios.get(`${API_BASE}/auth/users/me/`, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => {
      if (res.data.role === allowedRole) setStatus('authorized');
      else setStatus('unauthorized');
    })
    .catch(() => setStatus('unauthorized'));
  }, []);

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthorized') return <Navigate to="/" replace />;
  return children;
}