import { useEffect, useState } from "react";
import { API } from "../api";
import "../styles/Login.css";

export default function AdminApprove() {
  const storedUserId = localStorage.getItem("userId");
  const isAdminSession = localStorage.getItem("isAdmin") === "true" && Boolean(storedUserId);
  const [secret, setSecret] = useState("");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [confirmedIds, setConfirmedIds] = useState([]);
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
      setConfirmedIds((ids) => ids.filter((id) => id !== userId));
      setExpandedIds((ids) => ids.filter((id) => id !== userId));
    } catch (err) {
      setMessage(err.response?.data?.error || "Approval failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (userId) => {
    setExpandedIds((ids) => (ids.includes(userId) ? ids.filter((i) => i !== userId) : [...ids, userId]));
  };

  const toggleConfirm = (userId) => {
    setConfirmedIds((ids) => (ids.includes(userId) ? ids.filter((i) => i !== userId) : [...ids, userId]));
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
                    <div style={{ flex: 1 }}>
                      <strong>{user.username || "No username"}</strong>
                      <div>User ID: {user.userId}</div>
                      <div>Email: {user.email || "-"}</div>
                      <div>Mobile: {user.mobile || "-"}</div>
                      {user.createdAt && (
                        <div>Requested: {new Date(user.createdAt).toLocaleString()}</div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 160 }}>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => toggleExpand(user.userId)}
                      >
                        {expandedIds.includes(user.userId) ? "Hide Details" : "View Details"}
                      </button>

                      {expandedIds.includes(user.userId) && (
                        <div style={{ textAlign: "left", padding: "8px", background: "#fff", borderRadius: 6 }}>
                          <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: 12 }}>{JSON.stringify(user, null, 2)}</pre>
                          <div style={{ marginTop: 8 }}>
                            <label>
                              <input
                                type="checkbox"
                                checked={confirmedIds.includes(user.userId)}
                                onChange={() => toggleConfirm(user.userId)}
                              />{' '}
                              I confirm these details are correct
                            </label>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn-submit"
                        onClick={() => approveUser(user.userId)}
                        disabled={loading || !confirmedIds.includes(user.userId)}
                      >
                        Approve
                      </button>
                    </div>
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
