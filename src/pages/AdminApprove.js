import { useEffect, useState } from "react";
import { API } from "../api";
import "../styles/Login.css";

export default function AdminApprove() {
  const storedUserId = localStorage.getItem("userId");
  const isAdminSession = localStorage.getItem("isAdmin") === "true" && Boolean(storedUserId);
  const [secret, setSecret] = useState("");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadPendingUsers = async () => {
    if (!isAdminSession && !secret.trim()) {
      setMessage("Enter admin secret first.");
      return;
    }

    try {
      setLoadingUsers(true);
      setMessage("");

      const res = await API.get("/auth/pending-users", {
        params: { secret: isAdminSession ? "" : secret.trim() },
      });

      setPendingUsers(res.data.users || []);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to load pending users.");
      setPendingUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const approveUser = async (userId) => {
    if (!isAdminSession && !secret.trim()) {
      setMessage("Enter admin secret first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await API.post("/auth/approve-user", {
        userId,
        secret: isAdminSession ? "" : secret.trim(),
      });

      setMessage(`User ${userId} approved successfully.`);
      setPendingUsers((users) => users.filter((user) => user.userId !== userId));
    } catch (err) {
      setMessage(err.response?.data?.error || "Approval failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (secret.trim()) {
      setMessage("");
    }
  }, [secret]);

  useEffect(() => {
    if (localStorage.getItem("isAdmin") === "true" && !storedUserId) {
      setMessage("Admin flag present but not logged in. Please login as admin to use this panel.");
    }
  }, [storedUserId]);

  return (
    <div className="login-container">
      <div className="finance-bg">
        <div className="bg-image bg-1"></div>
        <div className="bg-image bg-2"></div>
        <div className="bg-image bg-3"></div>
      </div>

      <div className="login-card">
        <div className="auth-section">
          <h2 className="title">Admin Approval Panel</h2>
          <p className="subtitle">{isAdminSession ? "Admin session detected. You can approve users without entering a secret." : "Enter the admin secret, load pending users, and approve them with one click."}</p>

          {!isAdminSession && (
            <div className="form-group">
              <label>Admin Secret</label>
              <input
                type="password"
                className="input"
                placeholder="Enter admin secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>
          )}

          <button
            type="button"
            className="btn-submit"
            onClick={loadPendingUsers}
            disabled={loadingUsers || (!isAdminSession && !secret.trim())}
          >
            {loadingUsers ? "Loading users..." : "Load Pending Users"}
          </button>

          {message && (
            <div className={`message ${message.includes("success") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          {pendingUsers.length > 0 ? (
            <div className="pending-users">
              <h3>Pending Accounts</h3>
              <div className="pending-list">
                {pendingUsers.map((user) => (
                  <div key={user.userId} className="pending-card">
                    <div>
                      <strong>{user.username || "No username"}</strong>
                      <div>User ID: {user.userId}</div>
                      <div>Email: {user.email || "-"}</div>
                      <div>Mobile: {user.mobile || "-"}</div>
                    </div>
                    <button
                      type="button"
                      className="btn-submit"
                      onClick={() => approveUser(user.userId)}
                      disabled={loading}
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="small-note">
              {loadingUsers ? "" : "No pending accounts loaded. Click load to fetch pending users."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
