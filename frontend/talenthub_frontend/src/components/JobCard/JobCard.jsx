import React from 'react';
import './JobCard.css';

export default function JobCard({ job }) {
  const handleApply = () => {
    // Redirect to apply form or trigger modal
    console.log(`Applying for job ID: ${job.id}`);
  };

  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.description}</p>
      <button onClick={handleApply}>Apply</button>
    </div>
  );
}