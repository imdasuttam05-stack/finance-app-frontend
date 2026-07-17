import React, { useEffect, useState } from "react";
import { API } from "../api";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function MonthlyReport() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get("/transactions")
      .then((res) => setTransactions(res.data || []))
      .catch((err) => {
        console.error(err);
        setTransactions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === Number(month) && d.getFullYear() === Number(year);
  });

  const toNumber = (v) => (isNaN(Number(v)) ? 0 : Number(v));

  const getDrCr = (t) => {
    if (t.drcr === "DR" || t.drcr === "CR") return t.drcr;
    if (t.type === "received" || t.type === "income") return "CR";
    if (t.type === "payment" || t.type === "expense") return "DR";
    if (t.type === "loan" || t.type === "investment") {
      return t.subType === "liability" ? "CR" : "DR";
    }
    return "DR";
  };

  const totalDebit = filtered
    .filter((t) => getDrCr(t) === "DR")
    .reduce((s, t) => s + toNumber(t.amount), 0);

  const totalCredit = filtered
    .filter((t) => getDrCr(t) === "CR")
    .reduce((s, t) => s + toNumber(t.amount), 0);

  const total = totalDebit - totalCredit;

  const byCategory = filtered.reduce((acc, t) => {
    const key = t.category || (t.type || "other");
    acc[key] = (acc[key] || 0) + toNumber(t.amount);
    return acc;
  }, {});

  const years = [];
  for (let y = today.getFullYear(); y >= today.getFullYear() - 5; y--) years.push(y);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📅 Monthly Report</h1>
          <p>Complete monthly financial statement with filters.</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select className="select" value={month} onChange={(e) => setMonth(e.target.value)}>
            {monthNames.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          <select className="select" value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid">
        <div className="card" style={{ padding: 18 }}>
          <div className="card-title">Total for {monthNames[month]} {year}</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>₹ {total.toFixed(2)}</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="card-title">Total DR</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "green" }}>₹ {totalDebit.toFixed(2)}</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="card-title">Total CR</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "red" }}>₹ {totalCredit.toFixed(2)}</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="card-title">Category Breakdown</div>
          <div className="list" style={{ marginTop: 8 }}>
            {Object.keys(byCategory).length === 0 ? (
              <div className="list-item">No data</div>
            ) : (
              Object.entries(byCategory).map(([k, v]) => (
                <div className="list-item" key={k}>
                  <span style={{ textTransform: "capitalize" }}>{k}</span>
                  <strong>₹ {Number(v).toFixed(2)}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Transactions</h3>
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No transactions for selected month</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ddd", padding: 12 }}>Date</th>
                  <th style={{ borderBottom: "1px solid #ddd", padding: 12 }}>Details</th>
                  <th style={{ borderBottom: "1px solid #ddd", padding: 12, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id}>
                    <td style={{ padding: 12 }}>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>{t.note || t.category || t.type}</div>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>{t.personId?.name || ""}</div>
                    </td>
                    <td style={{ padding: 12, textAlign: "right" }}>₹ {toNumber(t.amount).toFixed(2)}</td>
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
