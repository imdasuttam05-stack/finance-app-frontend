import React, { useEffect, useState } from "react";
import { API } from "../api";

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [summaryRes, categoryRes] = await Promise.all([
          API.get("/transactions/summary"),
          API.get("/transactions/category-summary"),
        ]);

        if (!isMounted) return;

        setSummary(summaryRes?.data || {});
        setCategoryData(categoryRes?.data || {});
      } catch (err) {
        console.error("Dashboard load error:", err);

        if (!isMounted) return;

        setSummary({});
        setCategoryData({});
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ SAFE NUMBER HANDLING
  const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));

  const income = toNumber(summary.income);
  const expense = toNumber(summary.expense);
  const investment = toNumber(summary.investment);
  const asset = toNumber(summary.asset);
  const liability = toNumber(summary.liability);

  const net = income - expense;

  // ✅ CATEGORY SORT (SAFE)
  const categoryPairs = Object.entries(categoryData || {})
    .map(([k, v]) => [k, toNumber(v)])
    .filter(([, v]) => v !== 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Quick overview of your finance activity.</p>
        </div>
        <span className="pill">
          {loading ? "Loading…" : "Live summary"}
        </span>
      </div>

      {/* TOP GRID */}
      <div className="grid">
        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-title">Income</div>
          <div className="card-value money">₹{income.toFixed(2)}</div>
        </div>

        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-title">Expense</div>
          <div className="card-value money">₹{expense.toFixed(2)}</div>
        </div>

        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-title">Net (Income - Expense)</div>
          <div className="card-value money">₹{net.toFixed(2)}</div>
        </div>

        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-title">Investment</div>
          <div className="card-value money">₹{investment.toFixed(2)}</div>
        </div>

        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-title">Loan Asset</div>
          <div className="card-value money">₹{asset.toFixed(2)}</div>
        </div>

        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-title">Loan Liability</div>
          <div className="card-value money">₹{liability.toFixed(2)}</div>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="grid">
        {/* EXPENSE BREAKDOWN */}
        <div className="card" style={{ gridColumn: "span 7" }}>
          <div className="card-title">Expense Breakdown</div>

          <div className="list">
            {categoryPairs.length === 0 ? (
              <div className="list-item">
                <span>No expense data yet</span>
                <strong className="money">₹0.00</strong>
              </div>
            ) : (
              categoryPairs.slice(0, 10).map(([key, value]) => (
                <div className="list-item" key={key}>
                  <span style={{ textTransform: "capitalize" }}>
                    {key}
                  </span>
                  <strong className="money">
                    ₹{value.toFixed(2)}
                  </strong>
                </div>
              ))
            )}
          </div>
        </div>

        {/* HEALTH CHECK */}
        <div className="card" style={{ gridColumn: "span 5" }}>
          <div className="card-title">Health Check</div>

          <div className="list">
            <div className="list-item">
              <span>Saving rate</span>
              <strong>
                {income > 0
                  ? `${Math.max(0, (net / income) * 100).toFixed(1)}%`
                  : "—"}
              </strong>
            </div>

            <div className="list-item">
              <span>Expense vs Income</span>
              <strong>
                {income > 0
                  ? `${Math.min(999, (expense / income) * 100).toFixed(1)}%`
                  : "—"}
              </strong>
            </div>

            <div className="list-item">
              <span>Loan balance (Asset - Liability)</span>
              <strong className="money">
                ₹{(asset - liability).toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}