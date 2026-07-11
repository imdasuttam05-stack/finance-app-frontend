import React from "react";

export default function Profile() {
  const username = localStorage.getItem("username") || "User";
  const userId = localStorage.getItem("userId") || "N/A";
  const userMobile = localStorage.getItem("userMobile") || "N/A";
  const isApproved = localStorage.getItem("isApproved") || "Yes";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Your account information</p>
        </div>
      </div>

      <div className="card">
        <div className="profile-grid">
          <div className="profile-item">
            <div className="profile-label">Username</div>
            <div className="profile-value">{username}</div>
          </div>
          <div className="profile-item">
            <div className="profile-label">User ID</div>
            <div className="profile-value">{userId}</div>
          </div>
          <div className="profile-item">
            <div className="profile-label">Mobile</div>
            <div className="profile-value">{userMobile}</div>
          </div>
          <div className="profile-item">
            <div className="profile-label">Approval Status</div>
            <div className="profile-value">{isApproved === "true" ? "Approved" : isApproved === "false" ? "Pending" : isApproved}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
