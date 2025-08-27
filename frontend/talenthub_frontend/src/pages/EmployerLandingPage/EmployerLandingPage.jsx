import { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployerLandingPage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export default function EmployerLandingPage() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobPage, setJobPage] = useState(1);
  const [appPage, setAppPage] = useState(1);
  const [hasNextJobs, setHasNextJobs] = useState(true);
  const [hasNextApps, setHasNextApps] = useState(true);
  const [notification, setNotification] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    salary_confidential: false
  });
  const [showModal, setShowModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
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

  // Fetch jobs
  useEffect(() => {
    axios
      .get(`${API_BASE}/jobs/?page=${jobPage}&perpage=6`, {
        headers: { Authorization: `Token ${token}` }
      })
      .then(res => {
        const jobsArray = Array.isArray(res.data) ? res.data : res.data.results || [];
        setJobs(jobsArray);
        setHasNextJobs(jobsArray.length > 0);
      })
      .catch(err => {
        console.error('❌ Error fetching jobs:', err);
        setHasNextJobs(false);
      });
  }, [jobPage, token]);

  // Fetch applications
  useEffect(() => {
    axios
      .get(`${API_BASE}/applications/?page=${appPage}&perpage=5`, {
        headers: { Authorization: `Token ${token}` }
      })
      .then(res => {
        const appsArray = Array.isArray(res.data) ? res.data : res.data.results || [];
        setApplications(appsArray);
        setHasNextApps(appsArray.length > 0);
      })
      .catch(err => {
        console.error('❌ Error fetching applications:', err);
        setHasNextApps(false);
      });
  }, [appPage, token]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = id => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    axios
      .delete(`${API_BASE}/jobs/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      })
      .then(() => {
        setJobs(prev => prev.filter(j => j.id !== id));
        showNotification('success', '✅ Job deleted successfully');
      })
      .catch(err => {
        console.error('❌ Error deleting job:', err);
        showNotification('error', '❌ Failed to delete job');
      });
  };

  const handleEditClick = job => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      salary: job.salary && job.salary !== 'Confidential' ? job.salary : '',
      salary_confidential: job.salary_confidential || false
    });
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditingJobId(null);
    setFormData({
      title: '',
      description: '',
      requirements: '',
      salary: '',
      salary_confidential: false
    });
    setShowModal(true);
  };

  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    const method = editingJobId ? 'put' : 'post';
    const url = editingJobId
      ? `${API_BASE}/jobs/${editingJobId}/`
      : `${API_BASE}/jobs/`;

    axios[method](url, formData, {
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (editingJobId) {
          setJobs(prev => prev.map(j => (j.id === editingJobId ? res.data : j)));
          showNotification('success', '✅ Job updated successfully');
        } else {
          setJobs(prev => [res.data, ...prev]);
          showNotification('success', '✅ Job created successfully');
        }
        setEditingJobId(null);
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          requirements: '',
          salary: '',
          salary_confidential: false
        });
      })
      .catch(err => {
        console.error('❌ Error saving job:', err.response?.data || err.message);
        showNotification('error', '❌ Failed to save job');
      });
  };

  const handleViewResume = (url) => {
    if (url) {
      setResumeUrl(url);
      setShowResumeModal(true);
    } else {
      showNotification('error', '❌ No resume available for this applicant');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>
            <span className="logo-icon">💼</span>
            Employer Dashboard
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

        {/* Create Job Button */}
        <div className="top-actions">
          <button className="btn-primary" onClick={handleCreateClick}>
            ➕ Create Job
          </button>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  {editingJobId
                    ? `Edit Job: ${formData.title || 'Untitled'}`
                    : 'Create New Job'}
                </h2>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingJobId(null);
                  }}
                >
                  &times;
                </button>
              </div>
              <p className="modal-subheader">
                {editingJobId
                  ? 'Update your job posting details'
                  : 'Fill out the details for your new job posting'}
              </p>
              <form className="modal-job-form" onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    name="title"
                    placeholder="e.g. Senior Web Developer"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Job Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe the role, responsibilities, and what makes your company great"
                    rows="4"
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Job Requirements</label>
                  <textarea
                    name="requirements"
                    placeholder="List the required skills, experience, and qualifications"
                    rows="3"
                    value={formData.requirements}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    name="salary"
                    placeholder="Annual salary amount"
                    value={formData.salary}
                    onChange={handleFormChange}
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="form-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="salary_confidential"
                      checked={formData.salary_confidential}
                      onChange={handleFormChange}
                    />
                    <span className="checkmark"></span>
                    Keep salary confidential
                  </label>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingJobId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingJobId ? 'Save Changes' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resume Modal */}
        {showResumeModal && (
          <div className="modal-overlay">
            <div className="modal-content resume-modal">
              <div className="modal-header">
                <h2>Applicant Resume</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowResumeModal(false)}
                >
                  &times;
                </button>
              </div>
              <p className="modal-subheader">Viewing resume for the selected applicant</p>
              <div className="resume-container">
                {resumeUrl ? (
                  <iframe
                    src={resumeUrl}
                    title="Applicant Resume"
                    className="resume-iframe"
                  />
                ) : (
                  <p>No resume available</p>
                )}
              </div>
              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowResumeModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
          <button
            className={`tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
            onClick={() => setActiveTab('applicants')}
          >
            Applicants
          </button>
        </nav>

        {/* Job List */}
        {activeTab === 'jobs' && (
          <div className="job-container">
            <section className="job-list">
              <h2 className="section-title">Posted Jobs</h2>
              {jobs.length === 0 ? <p className="no-data">No jobs found.</p> : (
                <div className="job-grid">
                  {jobs.map(job => (
                    <div key={job.id} className="job-card">
                      <div className="job-card-header">
                        <h3>{job.title}</h3>
                      </div>
                      <div className="job-card-meta">
                        <span className="meta-item">
                          <i className="icon">💰</i>
                          {job.salary_confidential && job.salary === 'Confidential'
                            ? 'Confidential'
                            : job.salary ? `$${job.salary}` : 'Negotiable'}
                        </span>
                        <span className="meta-item">
                          <i className="icon">📅</i>
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {job.requirements && (
                        <p><strong>Requirements:</strong> {job.requirements}</p>
                      )}
                      <p className="job-desc">{job.description}</p>
                      <div className="card-actions">
                        <button className="btn-action btn-edit" onClick={() => handleEditClick(job)}>
                          <i className="icon">✏️</i> Edit
                        </button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(job.id)}>
                          <i className="icon">🗑️</i> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <div className="pagination">
              <button disabled={jobPage === 1} onClick={() => setJobPage(p => p - 1)}>
                Previous
              </button>
              <span>Page {jobPage}</span>
              <button disabled={!hasNextJobs} onClick={() => setJobPage(p => p + 1)}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Applicants List */}
        {activeTab === 'applicants' && (
          <div className="applicant-container">
            <section className="applicants-list">
              <h2 className="section-title">Applicants</h2>
              {applications.length === 0 ? <p className="no-data">No applicants found.</p> : (
                <>
                  <div className="table-container">
                    <table className="applicants-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Job Title</th>
                          <th>Applicant</th>
                          <th>Status</th>
                          <th>Applied At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map(app => (
                          <tr key={app.id}>
                            <td>{app.id}</td>
                            <td>{app.job_title || `Job #${app.job}`}</td>
                            <td>{app.user || 'N/A'}</td>
                            <td>
                              <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                                {app.status || 'N/A'}
                              </span>
                            </td>
                            <td>{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <button
                                className="btn-action btn-view-resume"
                                onClick={() => handleViewResume(app.resume_url)}
                              >
                                <i className="icon">📄</i> View Resume
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pagination">
                    <button disabled={appPage === 1} onClick={() => setAppPage(p => p - 1)}>
                      Previous
                    </button>
                    <span>Page {appPage}</span>
                    <button disabled={!hasNextApps} onClick={() => setAppPage(p => p + 1)}>
                      Next
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}