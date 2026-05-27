import React, { useEffect, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function DayBook() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    API.get("/transactions")
      .then((res) => {
        const list = res.data || [];
        setData(
          list.filter((t) =>
            new Date(t.date).toISOString().slice(0, 10) === date
          )
        );
      })
      .catch((err) => {
        console.error(err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [date]);

  const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      setDeleting(id);
      await API.delete(`/transactions/${id}`);
      setData((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeleting("");
    }
  };

  const total = data.reduce((s, t) => s + toNumber(t.amount), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📘 Day Book</h1>
          <p>Full daily transaction report with edit & delete actions.</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="pill">{loading ? "Loading..." : `${data.length} entries`}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Summary</div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="card" style={{ padding: 12, minWidth: 160 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Total</div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>₹ {total.toFixed(2)}</div>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <button className="btn" onClick={() => navigate("/transactions/new")}>New Transaction</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Transactions</h3>

        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p>No transactions for selected date</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ddd", padding: 12, textAlign: "left" }}>Time</th>
                  <th style={{ borderBottom: "1px solid #ddd", padding: 12, textAlign: "left" }}>Details</th>
                  <th style={{ borderBottom: "1px solid #ddd", padding: 12, textAlign: "right" }}>Amount</th>
                  <th style={{ borderBottom: "1px solid #ddd", padding: 12 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {data.map((t) => (
                  <tr key={t._id}>
                    <td style={{ padding: 12 }}>{new Date(t.date).toLocaleTimeString()}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>{t.note || t.category || t.type}</div>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>{t.personId?.name || ""}</div>
                    </td>
                    <td style={{ padding: 12, textAlign: "right" }}>₹ {toNumber(t.amount).toFixed(2)}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn secondary" onClick={() => navigate(`/edit/${t._id}`)}>Edit</button>
                        <button className="btn danger" onClick={() => handleDelete(t._id)} disabled={deleting === t._id}>{deleting === t._id ? "Deleting..." : "Delete"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
