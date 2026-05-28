import { useState } from "react";
import { API } from "../api";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("mobile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const requestOtp = async () => {
    if (!mobile.trim()) {
      alert("Enter your mobile number first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/request-otp", {
        mobile: mobile.trim(),
      });

      setStep("otp");
      setMessage(res.data.message || "OTP sent to your mobile number.");
      console.log("Demo OTP:", res.data.demoOtp);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "OTP request failed.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!mobile.trim() || !otp.trim()) {
      alert("Enter mobile number and OTP code.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/verify-otp", {
        mobile: mobile.trim(),
        code: otp.trim(),
      });

      const token = `user-${res.data.user.id}`;
      localStorage.setItem("token", token);
      localStorage.setItem("userMobile", res.data.user.mobile);

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: "auto", marginTop: 100 }}>
      <div className="card">
        <h2>Mobile OTP Login</h2>

        {step === "mobile" ? (
          <>
            <input
              className="input"
              placeholder="Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            <button className="btn" onClick={requestOtp} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              className="input"
              placeholder="Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            <input
              className="input"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button className="btn" onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              className="btn secondary"
              onClick={() => {
                setStep("mobile");
                setOtp("");
                setMessage("");
              }}
              style={{ marginTop: 10 }}
            >
              Use another mobile
            </button>
          </>
        )}

        {message && (
          <p style={{ marginTop: 16, color: "#065f46" }}>{message}</p>
        )}

        <p style={{ marginTop: 12, opacity: 0.7, fontSize: 14 }}>
          Same mobile number will always open the same account.
        </p>
      </div>
    </div>
  );
}
