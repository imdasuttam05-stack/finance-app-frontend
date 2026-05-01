import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    // 👉 demo login (later backend add korbo)
    if (email && password) {
      localStorage.setItem("token", "demo-token");
      window.location.href = "/dashboard";
    } else {
      alert("Enter email & password");
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: "auto", marginTop: 100 }}>
      <div className="card">
        <h2>🔐 Login</h2>

        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn" onClick={login}>
          Login
        </button>
      </div>
    </div>
  );
}