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
  const [viewMode, setViewMode] = useState("summary"); // "summary" or "daywise"

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

  // Group transactions by date for subledger view
  const groupedByDate = filtered.reduce((acc, t) => {
    const dateStr = new Date(t.date).toLocaleDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = { date: new Date(t.date), transactions: [], dr: 0, cr: 0 };
    }
    const drcr = getDrCr(t);
    acc[dateStr].transactions.push(t);
    if (drcr === "DR") {
      acc[dateStr].dr += toNumber(t.amount);
    } else {
      acc[dateStr].cr += toNumber(t.amount);
    }
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(groupedByDate[a].date) - new Date(groupedByDate[b].date)
  );

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

          <div style={{ display: "flex", gap: 6, marginLeft: 20 }}>
            <button
              className={`btn ${viewMode === "summary" ? "" : "secondary"}`}
              onClick={() => setViewMode("summary")}
              style={{ padding: "8px 12px", fontSize: 13 }}
            >
              Summary
            </button>
            <button
              className={`btn ${viewMode === "daywise" ? "" : "secondary"}`}
              onClick={() => setViewMode("daywise")}
              style={{ padding: "8px 12px", fontSize: 13 }}
            >
              Day-wise
            </button>
          </div>
        </div>
      </div>

      {viewMode === "summary" ? (
        <>
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
                      <th style={{ borderBottom: "1px solid #ddd", padding: 12, textAlign: "right" }}>DR</th>
                      <th style={{ borderBottom: "1px solid #ddd", padding: 12, textAlign: "right" }}>CR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => {
                      const drcr = getDrCr(t);
                      return (
                        <tr key={t._id}>
                          <td style={{ padding: 12 }}>{new Date(t.date).toLocaleDateString()}</td>
                          <td style={{ padding: 12 }}>
                            <div style={{ fontWeight: 700 }}>{t.note || t.category || t.type}</div>
                            <div style={{ fontSize: 12, opacity: 0.6 }}>{t.personId?.name || ""}</div>
                            {(t.category || t.subCategory) && (
                              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4, color: "#666" }}>
                                Ledger: {[t.category, t.subCategory].filter(Boolean).join(" > ")}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: 12, textAlign: "right" }}>
                            {drcr === "DR" ? `₹ ${toNumber(t.amount).toFixed(2)}` : "-"}
                          </td>
                          <td style={{ padding: 12, textAlign: "right" }}>
                            {drcr === "CR" ? `₹ ${toNumber(t.amount).toFixed(2)}` : "-"}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={2} style={{ padding: 12, fontWeight: 700, borderTop: "1px solid #ddd" }}>Totals</td>
                      <td style={{ padding: 12, textAlign: "right", fontWeight: 700, borderTop: "1px solid #ddd", color: "green" }}>
                        ₹ {totalDebit.toFixed(2)}
                      </td>
                      <td style={{ padding: 12, textAlign: "right", fontWeight: 700, borderTop: "1px solid #ddd", color: "red" }}>
                        ₹ {totalCredit.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: 12, fontWeight: 700 }}>Balance</td>
                      <td colSpan={2} style={{ padding: 12, textAlign: "right", fontWeight: 700 }}>
                        ₹ {Math.abs(total).toFixed(2)} {total >= 0 ? "DR" : "CR"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>📋 Day-wise Subledger ({monthNames[month]} {year})</h3>
          {loading ? (
            <p>Loading...</p>
          ) : sortedDates.length === 0 ? (
            <p>No transactions for selected month</p>
          ) : (
            <div>
              {sortedDates.map((dateStr) => {
                const dayData = groupedByDate[dateStr];
                const dayBalance = dayData.dr - dayData.cr;
                return (
                  <div key={dateStr} style={{ marginBottom: 24 }}>
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
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{dateStr}</div>
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, opacity: 0.7 }}>DR</div>
                          <div style={{ fontWeight: 700, color: "#991b1b" }}>₹ {dayData.dr.toFixed(2)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, opacity: 0.7 }}>CR</div>
                          <div style={{ fontWeight: 700, color: "#1e40af" }}>₹ {dayData.cr.toFixed(2)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, opacity: 0.7 }}>Balance</div>
                          <div style={{ fontWeight: 700, color: dayBalance >= 0 ? "#16a34a" : "#dc2626" }}>
                            ₹ {Math.abs(dayBalance).toFixed(2)} {dayBalance >= 0 ? "DR" : "CR"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                        <tbody>
                          {dayData.transactions.map((t, idx) => {
                            const drcr = getDrCr(t);
                            return (
                              <tr key={t._id} style={{ backgroundColor: idx % 2 === 0 ? "#f9fafb" : "white" }}>
                                <td style={{ padding: 10, fontSize: 13 }}>{new Date(t.date).toLocaleTimeString()}</td>
                                <td style={{ padding: 10, fontSize: 13 }}>
                                  <div style={{ fontWeight: 600 }}>{t.note || t.category || t.type}</div>
                                  <div style={{ fontSize: 11, opacity: 0.6 }}>{t.personId?.name || ""}</div>
                                  {(t.category || t.subCategory) && (
                                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, color: "#666" }}>
                                      Ledger: {[t.category, t.subCategory].filter(Boolean).join(" > ")}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: 10, textAlign: "right", fontSize: 13, backgroundColor: drcr === "DR" ? "#fecaca" : "transparent", color: "#991b1b" }}>
                                  {drcr === "DR" ? `₹ ${toNumber(t.amount).toFixed(2)}` : "-"}
                                </td>
                                <td style={{ padding: 10, textAlign: "right", fontSize: 13, backgroundColor: drcr === "CR" ? "#bfdbfe" : "transparent", color: "#1e40af" }}>
                                  {drcr === "CR" ? `₹ ${toNumber(t.amount).toFixed(2)}` : "-"}
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
      )}
    </div>
  );
}
