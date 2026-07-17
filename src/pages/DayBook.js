import React, { useEffect, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function DayBook() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const [viewMode, setViewMode] = useState("subledger"); // "table" or "subledger"

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

  const isDR = (transaction) => {
    if (!transaction) return false;
    if (transaction.drcr) {
      return String(transaction.drcr).toUpperCase() === "DR";
    }

    const type = (transaction.type || "").toLowerCase();
    return ["loan", "expense", "given", "debit", "payment"].includes(type) || String(transaction.type).toUpperCase() === "DR";
  };

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

  const drTotal = data.reduce((s, t) => s + (isDR(t) ? toNumber(t.amount) : 0), 0);
  const crTotal = data.reduce((s, t) => s + (!isDR(t) ? toNumber(t.amount) : 0), 0);

  // Group by category/subledger
  const groupedByLedger = data.reduce((acc, t) => {
    const ledgerKey = [t.category, t.subCategory].filter(Boolean).join(" > ") || t.type;
    if (!acc[ledgerKey]) {
      acc[ledgerKey] = { transactions: [], dr: 0, cr: 0 };
    }
    const isDrTx = isDR(t);
    acc[ledgerKey].transactions.push(t);
    if (isDrTx) {
      acc[ledgerKey].dr += toNumber(t.amount);
    } else {
      acc[ledgerKey].cr += toNumber(t.amount);
    }
    return acc;
  }, {});

  const ledgerKeys = Object.keys(groupedByLedger).sort();

  // Category breakdown for summary
  const byCategory = data.reduce((acc, t) => {
    const key = t.category || t.type || "other";
    acc[key] = (acc[key] || 0) + toNumber(t.amount);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📘 Day Book</h1>
          <p>Full daily transaction report with subledger details.</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="pill">{loading ? "Loading..." : `${data.length} entries`}</div>

          <div style={{ display: "flex", gap: 6, marginLeft: 20 }}>
            <button
              className={`btn ${viewMode === "subledger" ? "" : "secondary"}`}
              onClick={() => setViewMode("subledger")}
              style={{ padding: "8px 12px", fontSize: 13 }}
            >
              Subledger
            </button>
            <button
              className={`btn ${viewMode === "table" ? "" : "secondary"}`}
              onClick={() => setViewMode("table")}
              style={{ padding: "8px 12px", fontSize: 13 }}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card" style={{ padding: 18 }}>
          <div className="card-title">Total for {date}</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>₹ {(drTotal - crTotal).toFixed(2)}</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="card-title">Total DR</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#991b1b" }}>₹ {drTotal.toFixed(2)}</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="card-title">Total CR</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#1e40af" }}>₹ {crTotal.toFixed(2)}</div>
        </div>

        {data.length > 0 && (
          <div className="card" style={{ padding: 18 }}>
            <div className="card-title">Category Breakdown</div>
            <div className="list" style={{ marginTop: 8 }}>
              {Object.entries(byCategory).map(([k, v]) => (
                <div className="list-item" key={k}>
                  <span style={{ textTransform: "capitalize" }}>{k}</span>
                  <strong>₹ {Number(v).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewMode === "subledger" ? (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>📋 Subledger View</h3>
          {loading ? (
            <p>Loading...</p>
          ) : ledgerKeys.length === 0 ? (
            <p>No transactions for selected date</p>
          ) : (
            <div>
              {ledgerKeys.map((ledgerKey) => {
                const ledgerData = groupedByLedger[ledgerKey];
                const ledgerBalance = ledgerData.dr - ledgerData.cr;
                return (
                  <div key={ledgerKey} style={{ marginBottom: 24 }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "12px 12px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: 6,
                      marginBottom: 8
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{ledgerKey}</div>
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, opacity: 0.7 }}>DR</div>
                          <div style={{ fontWeight: 700, color: "#991b1b" }}>₹ {ledgerData.dr.toFixed(2)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, opacity: 0.7 }}>CR</div>
                          <div style={{ fontWeight: 700, color: "#1e40af" }}>₹ {ledgerData.cr.toFixed(2)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, opacity: 0.7 }}>Balance</div>
                          <div style={{ fontWeight: 700, color: ledgerBalance >= 0 ? "#16a34a" : "#dc2626" }}>
                            ₹ {Math.abs(ledgerBalance).toFixed(2)} {ledgerBalance >= 0 ? "DR" : "CR"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                        <tbody>
                          {ledgerData.transactions.map((t, idx) => {
                            const isDrTx = isDR(t);
                            return (
                              <tr key={t._id} style={{ backgroundColor: idx % 2 === 0 ? "#f9fafb" : "white" }}>
                                <td style={{ padding: 10, fontSize: 13 }}>{new Date(t.date).toLocaleTimeString()}</td>
                                <td style={{ padding: 10, fontSize: 13 }}>
                                  <div style={{ fontWeight: 600 }}>{t.note || t.type}</div>
                                  <div style={{ fontSize: 11, opacity: 0.6 }}>{t.personId?.name || ""}</div>
                                </td>
                                <td style={{ padding: 10, textAlign: "right", fontSize: 13, backgroundColor: isDrTx ? "#fecaca" : "transparent", color: "#991b1b" }}>
                                  {isDrTx ? `₹ ${toNumber(t.amount).toFixed(2)}` : "-"}
                                </td>
                                <td style={{ padding: 10, textAlign: "right", fontSize: 13, backgroundColor: !isDrTx ? "#bfdbfe" : "transparent", color: "#1e40af" }}>
                                  {!isDrTx ? `₹ ${toNumber(t.amount).toFixed(2)}` : "-"}
                                </td>
                                <td style={{ padding: 10 }}>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button className="btn secondary" onClick={() => navigate(`/edit/${t._id}`)} style={{ padding: "6px 10px", fontSize: 12 }}>Edit</button>
                                    <button className="btn danger" onClick={() => handleDelete(t._id)} disabled={deleting === t._id} style={{ padding: "6px 10px", fontSize: 12 }}>
                                      {deleting === t._id ? "..." : "Del"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
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
                    <th style={{ borderBottom: "1px solid #ddd", padding: 12, textAlign: "right", backgroundColor: "#fee2e2" }}>DR</th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: 12, textAlign: "right", backgroundColor: "#dbeafe" }}>CR</th>
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
                        {(t.category || t.subCategory) && (
                          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4, color: "#666" }}>
                            Ledger: {[t.category, t.subCategory].filter(Boolean).join(" > ")}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: 12, textAlign: "right", backgroundColor: isDR(t) ? "#fecaca" : "transparent" }}>
                        {isDR(t) ? `₹ ${toNumber(t.amount).toFixed(2)}` : "-"}
                      </td>
                      <td style={{ padding: 12, textAlign: "right", backgroundColor: !isDR(t) ? "#bfdbfe" : "transparent" }}>
                        {!isDR(t) ? `₹ ${toNumber(t.amount).toFixed(2)}` : "-"}
                      </td>
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
      )}
    </div>
  );
}
