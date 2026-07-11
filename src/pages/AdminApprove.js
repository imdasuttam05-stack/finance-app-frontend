import { useEffect, useState } from "react";
import { API } from "../api";
import "../styles/Login.css";

export default function AdminApprove() {
  const storedUserId = localStorage.getItem("userId");
  const isAdminSession = localStorage.getItem("isAdmin") === "true" && Boolean(storedUserId);
  const [secret, setSecret] = useState("");
  const [adminLoginUser, setAdminLoginUser] = useState("");
  const [adminLoginPass, setAdminLoginPass] = useState("");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [confirmedIds, setConfirmedIds] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [lastRequestInfo, setLastRequestInfo] = useState(null);

  const loadPendingUsers = async () => {
    if (!isAdminSession && !secret.trim()) {
      setMessage("Enter admin secret first.");
      return;
    }

    try {
      setLoadingUsers(true);
      setMessage("");

      const getOptions = {};
      if (!isAdminSession && secret.trim()) {
        getOptions.params = { secret: secret.trim() };
      }
      if (isAdminSession && storedUserId) {
        getOptions.headers = { "x-user-id": storedUserId };
      }

      const res = await API.get("/auth/pending-users", getOptions);

      setPendingUsers(res.data.users || []);
      setLastRequestInfo({ success: true, status: res.status, url: res.config?.url });
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to load pending users.");
      setPendingUsers([]);
      setLastRequestInfo({ success: false, status: err.response?.status, data: err.response?.data });
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

      const approveBody = { userId };
      if (!isAdminSession && secret.trim()) {
        approveBody.secret = secret.trim();
      }
      const approveOpts = {};
      if (isAdminSession && storedUserId) {
        approveOpts.headers = { "x-user-id": storedUserId };
      }

      await API.post("/auth/approve-user", approveBody, approveOpts);

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

  const rejectUser = async (userId) => {
    if (!isAdminSession && !secret.trim()) {
      setMessage("Enter admin secret first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const rejectBody = { userId };
      if (!isAdminSession && secret.trim()) {
        rejectBody.secret = secret.trim();
      }
      const rejectOpts = {};
      if (isAdminSession && storedUserId) {
        rejectOpts.headers = { "x-user-id": storedUserId };
      }

      await API.post("/auth/reject-user", rejectBody, rejectOpts);

      setMessage(`User ${userId} rejected successfully.`);
      setPendingUsers((users) => users.filter((user) => user.userId !== userId));
      setConfirmedIds((ids) => ids.filter((id) => id !== userId));
      setExpandedIds((ids) => ids.filter((id) => id !== userId));
    } catch (err) {
      setMessage(err.response?.data?.error || "Rejection failed.");
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

          <div style={{ marginTop: 8, marginBottom: 12, padding: 8, background: "#f6f6fb", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#333" }}><strong>Debug</strong></div>
            <div style={{ fontSize: 12, marginTop: 6 }}>
              <div>storedUserId: {storedUserId || "(none)"}</div>
              <div>isAdmin flag: {localStorage.getItem("isAdmin") || "(none)"}</div>
              <div>secret present: {secret.trim() ? "yes" : "no"}</div>
              <div>pendingUsers: {pendingUsers.length}</div>
              {lastRequestInfo && (
                <div style={{ marginTop: 6 }}>
                  <div>lastRequest success: {String(lastRequestInfo.success)}</div>
                  <div>status: {lastRequestInfo.status || "-"}</div>
                  <div>{lastRequestInfo.data ? JSON.stringify(lastRequestInfo.data) : ""}</div>
                </div>
              )}
            </div>
          </div>

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

          {!isAdminSession && (
            <div style={{ marginTop: 12 }}>
              <details>
                <summary style={{ cursor: "pointer" }}>Admin Login (use admin credentials)</summary>
                <div style={{ marginTop: 8 }}>
                  <div className="form-group">
                    <label>Admin Username</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="admin"
                      value={adminLoginUser}
                      onChange={(e) => setAdminLoginUser(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Admin Password</label>
                    <input
                      type="password"
                      className="input"
                      placeholder="Admin password"
                      value={adminLoginPass}
                      onChange={(e) => setAdminLoginPass(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={async () => {
                      if (!adminLoginUser.trim() || !adminLoginPass.trim()) {
                        setMessage("Enter admin credentials");
                        return;
                      }

                      try {
                        setLoading(true);
                        setMessage("");
                        const res = await API.post("/auth/login", {
                          username: adminLoginUser.trim(),
                          password: adminLoginPass.trim(),
                        });

                        if (res.data?.success && res.data.user) {
                          localStorage.setItem("token", `user-${res.data.user.id}`);
                          localStorage.setItem("userId", res.data.user.userId);
                          localStorage.setItem("username", res.data.user.username || "");
                          localStorage.setItem("userMobile", res.data.user.mobile || "");
                          localStorage.setItem("isApproved", String(res.data.user.isApproved));
                          localStorage.setItem("isAdmin", String(res.data.user.isAdmin || false));
                          localStorage.setItem("role", res.data.user.role || "user");

                          setMessage("Admin login successful. Reloading...");
                          setTimeout(() => window.location.reload(), 800);
                        }
                      } catch (err) {
                        setMessage(err.response?.data?.error || "Admin login failed");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Login as Admin
                  </button>
                </div>
              </details>
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

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="btn-submit"
                          onClick={() => approveUser(user.userId)}
                          disabled={loading || !confirmedIds.includes(user.userId)}
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => rejectUser(user.userId)}
                          disabled={loading || !confirmedIds.includes(user.userId)}
                        >
                          Reject
                        </button>
                      </div>
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
