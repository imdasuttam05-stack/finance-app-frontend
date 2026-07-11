import { useState } from "react";
import { API } from "../api";
import "../styles/Login.css";

export default function Login() {
  const [step, setStep] = useState("intro"); // intro, registration, otp, password, login
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState("");

  // Login fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setMessage("Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/login", {
        username: loginUsername.trim(),
        password: loginPassword.trim(),
      });

      if (res.data.success) {
        const token = `user-${res.data.user.id}`;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", res.data.user.userId);
        localStorage.setItem("username", res.data.user.username);
        localStorage.setItem("userMobile", res.data.user.mobile);

        setMessage(`Login successful! Your User ID: ${res.data.user.userId}`);

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request OTP for Registration
  const handleRegisterMobile = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !mobile.trim()) {
      setMessage("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/request-otp", {
        mobile: mobile.trim(),
      });

      if (res.data.success) {
        setStep("otp");
        setMessage(res.data.message);
        if (res.data.demoOtp) {
          console.log("Demo OTP:", res.data.demoOtp);
        }
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setMessage("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/verify-otp", {
        mobile: mobile.trim(),
        code: otp.trim(),
      });

      if (res.data.success) {
        setStep("password");
        setMessage("OTP verified successfully! Now set your password.");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration with Password
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!password.trim() || !confirmPassword.trim()) {
      setMessage("Please enter password");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/register", {
        mobile: mobile.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data.success) {
        setRegisteredUserId(res.data.user.userId || "");
        setStep("success");
        setMessage("");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("intro");
    setUsername("");
    setEmail("");
    setMobile("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setLoginUsername("");
    setLoginPassword("");
    setMessage("");
    setRegisteredUserId("");
  };

  return (
    <div className="login-container">
      {/* Finance Background Images */}
      <div className="finance-bg">
        <div className="bg-image bg-1"></div>
        <div className="bg-image bg-2"></div>
        <div className="bg-image bg-3"></div>
      </div>

      <div className="login-card">
        {/* Step: Intro/Choose Login or Register */}
        {step === "intro" && (
          <div className="auth-section">
            <h1 className="title">💰 Finance Manager</h1>
            <p className="subtitle">Manage your finances efficiently</p>

            <div className="button-group">
              <button
                className="auth-btn login-btn"
                onClick={() => {
                  setStep("login");
                  setMessage("");
                }}
              >
                Login
              </button>
              <button
                className="auth-btn register-btn"
                onClick={() => {
                  setStep("register");
                  setMessage("");
                }}
              >
                Register
              </button>
            </div>
          </div>
        )}

        {/* Step: Login */}
        {step === "login" && (
          <div className="auth-section">
            <h2 className="title">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username or Email</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter username or email"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="footer">
              <button className="link-btn" onClick={resetForm}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step: Register - Basic Info */}
        {step === "register" && (
          <div className="auth-section">
            <h2 className="title">Create Account</h2>
            <form onSubmit={handleRegisterMobile}>
              <div className="form-group">
                <label>User Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mail ID</label>
                <input
                  type="email"
                  className="input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>

            <div className="footer">
              <button className="link-btn" onClick={resetForm}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step: OTP Verification */}
        {step === "otp" && (
          <div className="auth-section">
            <h2 className="title">Verify OTP</h2>
            <p className="subtitle">Enter OTP sent to {mobile}</p>
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label>OTP Code</label>
                <input
                  type="text"
                  className="input otp-input"
                  placeholder="000000"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              {message && (
                <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                className="link-btn"
                onClick={handleRegisterMobile}
                disabled={loading}
              >
                Resend OTP
              </button>
            </form>

            <div className="footer">
              <button className="link-btn" onClick={resetForm}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="auth-section">
            <h2 className="title">Registration Complete</h2>
            <p className="subtitle">Your account is created and is now pending approval. Once approved, you will be able to log in.</p>

            <div className="message success" style={{ textAlign: "left", marginBottom: "12px" }}>
              <strong>Your User ID</strong>
              <div style={{ marginTop: "6px", fontSize: "1rem", wordBreak: "break-all" }}>
                {registeredUserId}
              </div>
            </div>

            <button
              type="button"
              className="btn-submit"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Step: Set Password */}
        {step === "password" && (
          <div className="auth-section">
            <h2 className="title">Set Password</h2>
            <p className="subtitle">Create a strong password for your account</p>
            <form onSubmit={handleCompleteRegistration}>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Complete Registration"}
              </button>
            </form>

            <div className="footer">
              <button className="link-btn" onClick={resetForm}>
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
