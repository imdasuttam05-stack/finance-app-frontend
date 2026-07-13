import React, { useEffect, useState } from "react";
import { API } from "../api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/me");
      if (res.data?.success) {
        setUser(res.data.user);
        setForm({
          username: res.data.user.username || "",
          email: res.data.user.email || "",
          mobile: res.data.user.mobile || "",
          password: "",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setLoading(true);
      setMessage("");
      const payload = { username: form.username, email: form.email, mobile: form.mobile };
      if (form.password) payload.password = form.password;

      const res = await API.put("/auth/update-profile", payload);
      if (res.data?.success) {
        setUser(res.data.user);
        localStorage.setItem("username", res.data.user.username || "");
        localStorage.setItem("userMobile", res.data.user.mobile || "");
        setMessage("Profile updated successfully");
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>View and edit your account details</p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="pill">{user ? user.username : "User"}</div>
        </div>
      </div>

      <div className="card">
        {message && <div style={{ marginBottom: 12 }} className={`message ${message.includes("success") ? "success" : "error"}`}>{message}</div>}

        {loading && !user ? (
          <div>Loading...</div>
        ) : (
          <div className="profile-grid">
            <div style={{ gridColumn: "span 6" }}>
              <div className="field">
                <label className="label">Username</label>
                <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={!editing} />
              </div>

              <div className="field" style={{ marginTop: 12 }}>
                <label className="label">Email</label>
                <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!editing} />
              </div>

              <div className="field" style={{ marginTop: 12 }}>
                <label className="label">Mobile</label>
                <input className="input" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} disabled={!editing} />
              </div>

              <div className="field" style={{ marginTop: 12 }}>
                <label className="label">New Password (leave blank to keep)</label>
                <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={!editing} />
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                {!editing ? (
                  <button className="btn" onClick={() => setEditing(true)}>Edit Profile</button>
                ) : (
                  <>
                    <button className="btn" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
                    <button className="btn secondary" onClick={() => { setEditing(false); load(); }}>Cancel</button>
                  </>
                )}
              </div>
            </div>

            <div style={{ gridColumn: "span 6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, background: "linear-gradient(135deg,#e0f2fe,#ccfbf1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900 }}>
                  {user ? (user.username || "U")[0].toUpperCase() : "U"}
                </div>

                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{user?.username || "User"}</div>
                  <div style={{ color: "var(--muted)", marginTop: 6 }}>{user?.email || ""}</div>
                  <div style={{ color: "var(--muted)", marginTop: 6 }}>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
