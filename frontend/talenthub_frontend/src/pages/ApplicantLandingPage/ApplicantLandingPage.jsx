import { useEffect, useState } from 'react';
import axios from 'axios';
import './ApplicantLandingPage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || 'http://127.0.0.1:8000/auth';

export default function ApplicantDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobsPage, setJobsPage] = useState(1);
  const [appsPage, setAppsPage] = useState(1);
  const [hasNextJobs, setHasNextJobs] = useState(true);
  const [hasNextApps, setHasNextApps] = useState(true);
  const [notification, setNotification] = useState(null);
  const [userId, setUserId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('applied');
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('jobs');

  const token = localStorage.getItem('authToken');

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

  // Fetch user ID
  useEffect(() => {
    if (!token) return;
    axios.get(`${AUTH_BASE}/users/me/`, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => setUserId(res.data.id))
    .catch(err => console.error("❌ Error fetching user ID:", err));
  }, [token]);

  // Fetch jobs
  useEffect(() => {
    axios.get(`${API_BASE}/jobs/?page=${jobsPage}`, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => {
      const jobsArray = Array.isArray(res.data) ? res.data : (res.data.results || []);
      if (jobsArray.length === 0 && jobsPage !== 1) {
        setJobsPage(1);
        return;
      }
      setJobs(jobsArray);
      setHasNextJobs(jobsArray.length > 0);
    })
    .catch(() => setHasNextJobs(false));
  }, [jobsPage, token]);

  // Fetch applications
  useEffect(() => {
    axios.get(`${API_BASE}/applications/?status=${statusFilter}&page=${appsPage}`, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => {
      const appsArray = Array.isArray(res.data) ? res.data : (res.data.results || []);
      if (appsArray.length === 0 && appsPage !== 1) {
        setAppsPage(1);
        return;
      }
      setApplications(appsArray);
      setHasNextApps(appsArray.length > 0);
    })
    .catch(() => setHasNextApps(false));
  }, [appsPage, statusFilter, token]);

  const handleApply = (jobId) => {
    if (!userId) {
      showNotification('error', '❌ Unable to apply — user not loaded yet.');
      return;
    }
    const jobTitle = jobs.find(j => j.id === jobId)?.title || 'this job';
    if (!window.confirm(`Are you sure you want to apply for "${jobTitle}"?`)) return;

    axios.post(`${API_BASE}/applications/`, { job: jobId, user: userId }, {
      headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" }
    })
    .then(res => {
      setApplications(prev => [...prev, res.data]);
      showNotification('success', '✅ Application submitted successfully');
    })
    .catch(err => {
      console.error('❌ Error applying for job:', err);
      showNotification('error', '❌ Failed to submit application');
    });
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setAppsPage(1);
  };

  const isApplied = (jobId) => applications.some(app => app.job === jobId || app.job?.id === jobId);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>
            <span className="logo-icon">🎓</span>
            Applicant Dashboard
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
          <div className={`notification ${notification.type}`}>{notification.message}</div>
        )}
        <nav className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
          <button
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
        </nav>
        {activeTab === 'jobs' && (
          <section className="job-list">
            <h2 className="section-title">Available Jobs</h2>
            {jobs.length === 0 ? <p className="no-data">No jobs found.</p> : (
              <div className="job-list-grid">
                {jobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-card-header">
                      <h3>{job.title}</h3>
                    </div>
                    <div className="job-card-meta">
                      <span className="meta-item">
                        <i className="icon">💰</i> {job.salary ? `$${job.salary}` : 'Negotiable'}
                      </span>
                    </div>
                    <p className="job-desc">{job.description}</p>
                    <div className="job-card-footer">
                      <span className="post-date">
                        Posted: {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                      {isApplied(job.id) ? (
                        <button className="btn-applied" disabled>
                          <i className="icon">✅</i> Applied
                        </button>
                      ) : (
                        <button className="btn-apply" onClick={() => handleApply(job.id)}>
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pagination">
              <button disabled={jobsPage === 1} onClick={() => setJobsPage(p => p - 1)}>Previous</button>
              <span>Page {jobsPage}</span>
              <button disabled={!hasNextJobs} onClick={() => setJobsPage(p => p + 1)}>Next</button>
            </div>
          </section>
        )}
        {activeTab === 'applications' && (
          <section className="applications-section">
            <h2 className="section-title">My Applications</h2>
            <div className="status-filters">
              {['applied', 'shortlisted', 'rejected'].map(status => (
                <button
                  key={status}
                  className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => handleFilterChange(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="application-list">
              {applications.length === 0 ? <p className="no-data">No {statusFilter} applications found.</p> : (
                applications.map(app => (
                  <div key={app.id} className="application-card">
                    <div className="app-card-header">
                      <h3>{app.job_title || `Job #${app.job}`}</h3>
                      <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                        {app.status || 'N/A'}
                      </span>
                    </div>
                    <div className="app-card-details">
                      <p className="app-date">
                        <i className="icon">📅</i> Applied on: {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
                      </p>
                      {app.job_description && <p className="app-desc">{app.job_description}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="pagination">
              <button disabled={appsPage === 1} onClick={() => setAppsPage(p => p - 1)}>Previous</button>
              <span>Page {appsPage}</span>
              <button disabled={!hasNextApps} onClick={() => setAppsPage(p => p + 1)}>Next</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}