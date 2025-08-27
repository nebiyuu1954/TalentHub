import { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminLandingPage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://talenthub-f7ef.onrender.com/api';

export default function AdminLandingPage() {
  const token = localStorage.getItem('authToken');
  const perPage = 5;

  // Data states
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  // Pagination states
  const [userPage, setUserPage] = useState(1);
  const [jobPage, setJobPage] = useState(1);
  const [appPage, setAppPage] = useState(1);

  const [hasNextUsers, setHasNextUsers] = useState(false);
  const [hasNextJobs, setHasNextJobs] = useState(false);
  const [hasNextApps, setHasNextApps] = useState(false);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [theme, setTheme] = useState('light');

  // Load theme preference
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetchers
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users/?page=${userPage}&perpage=${perPage}`, {
        headers: { Authorization: `Token ${token}` }
      });
      setUsers(res.data);
      setHasNextUsers(res.data.length === perPage);
    } catch {
      setUsers([]);
      setHasNextUsers(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs/?page=${jobPage}&perpage=${perPage}`, {
        headers: { Authorization: `Token ${token}` }
      });
      setJobs(res.data);
      setHasNextJobs(res.data.length === perPage);
    } catch {
      setJobs([]);
      setHasNextJobs(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/applications/?page=${appPage}&perpage=${perPage}`, {
        headers: { Authorization: `Token ${token}` }
      });
      setApplications(res.data);
      setHasNextApps(res.data.length === perPage);
    } catch {
      setApplications([]);
      setHasNextApps(false);
    }
  };

  // Initial + paginated fetch
  useEffect(() => { 
    setLoading(true); 
    fetchUsers(); 
    fetchJobs(); 
    fetchApplications(); 
    setLoading(false); 
  }, []);
  
  useEffect(() => { fetchUsers(); }, [userPage]);
  useEffect(() => { fetchJobs(); }, [jobPage]);
  useEffect(() => { fetchApplications(); }, [appPage]);

  if (loading) return <div className="admin-loading">⏳ Loading...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>
            <span className="logo-icon">⚙️</span>
            Admin Dashboard
          </h1>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem('authToken');
                window.location.href = '/';
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>
      <main className="dashboard-content">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* USERS */}
        <section className="admin-section">
          <h2 className="section-title">
            <span className="icon">👤</span> Users
          </h2>
          {users.length === 0 ? (
            <p className="no-data">No users found.</p>
          ) : (
            <>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge role-${u.role?.toLowerCase()}`}>
                            {u.role || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination">
                <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)}>Previous</button>
                <span>Page {userPage}</span>
                <button disabled={!hasNextUsers} onClick={() => setUserPage(p => p + 1)}>Next</button>
              </div>
            </>
          )}
        </section>

        {/* JOBS */}
        <section className="admin-section">
          <h2 className="section-title">
            <span className="icon">💼</span> Jobs
          </h2>
          {jobs.length === 0 ? (
            <p className="no-data">No jobs found.</p>
          ) : (
            <>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Salary</th>
                      <th>Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id}>
                        <td>{j.id}</td>
                        <td>{j.title}</td>
                        <td>{j.salary ? `$${j.salary}` : 'Negotiable'}</td>
                        <td>{j.created_by || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination">
                <button disabled={jobPage === 1} onClick={() => setJobPage(p => p - 1)}>Previous</button>
                <span>Page {jobPage}</span>
                <button disabled={!hasNextJobs} onClick={() => setJobPage(p => p + 1)}>Next</button>
              </div>
            </>
          )}
        </section>

        {/* APPLICATIONS */}
        <section className="admin-section">
          <h2 className="section-title">
            <span className="icon">📄</span> Applications
          </h2>
          {applications.length === 0 ? (
            <p className="no-data">No applications found.</p>
          ) : (
            <>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Job</th>
                      <th>User</th>
                      <th>Status</th>
                      <th>Applied At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(a => (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{a.job_title || a.job}</td>
                        <td>{a.user || 'N/A'}</td>
                        <td>
                          <span className={`status-badge status-${a.status?.toLowerCase()}`}>
                            {a.status || 'N/A'}
                          </span>
                        </td>
                        <td>{a.applied_at ? new Date(a.applied_at).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination">
                <button disabled={appPage === 1} onClick={() => setAppPage(p => p - 1)}>Previous</button>
                <span>Page {appPage}</span>
                <button disabled={!hasNextApps} onClick={() => setAppPage(p => p + 1)}>Next</button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}