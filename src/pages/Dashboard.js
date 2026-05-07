import React, { useEffect, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [summaryRes, categoryRes, txnRes] = await Promise.all([
          API.get("/transactions/summary"),
          API.get("/transactions/category-summary"),
          API.get("/transactions"),
        ]);

        if (!isMounted) return;

        setSummary(summaryRes?.data || {});
        setCategoryData(categoryRes?.data || {});
        setTransactions(txnRes?.data || []);

      } catch (err) {
        console.error("Dashboard load error:", err);

        if (!isMounted) return;

        setSummary({});
        setCategoryData({});
        setTransactions([]);

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

  const toNumber = (val) =>
    isNaN(Number(val)) ? 0 : Number(val);

  const income = toNumber(summary.income);
  const expense = toNumber(summary.expense);
  const investment = toNumber(summary.investment);
  const asset = toNumber(summary.asset);
  const liability = toNumber(summary.liability);

  const net = income - expense;

  const categoryPairs = Object.entries(categoryData || {})
    .map(([k, v]) => [k, toNumber(v)])
    .filter(([, v]) => v !== 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>📊 Dashboard</h1>
          <p>Professional finance overview</p>
        </div>

        <span className="pill">
          {loading ? "Loading..." : "Live"}
        </span>
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.grid}>

        <SummaryCard
          title="Income"
          value={income}
          color="green"
          onClick={() => navigate("/report/income")}
        />

        <SummaryCard
          title="Expense"
          value={expense}
          color="red"
          onClick={() => navigate("/report/expense")}
        />

        <SummaryCard
          title="Net"
          value={net}
          color="#2563eb"
          onClick={() => navigate("/report/net")}
        />

        <SummaryCard
          title="Investment"
          value={investment}
          color="#7c3aed"
          onClick={() => navigate("/report/investment")}
        />

        <SummaryCard
          title="Asset"
          value={asset}
          color="green"
          onClick={() => navigate("/report/asset")}
        />

        <SummaryCard
          title="Liability"
          value={liability}
          color="red"
          onClick={() => navigate("/report/liability")}
        />

      </div>

      {/* QUICK REPORTS */}
      <div style={styles.quickGrid}>

        <div
          style={styles.quickCard}
          onClick={() => navigate("/daybook")}
        >
          <h2>📘 Day Book</h2>

          <p>
            Full daily transaction report with
            edit & delete actions.
          </p>
        </div>

        <div
          style={styles.quickCard}
          onClick={() => navigate("/monthly")}
        >
          <h2>📅 Monthly Report</h2>

          <p>
            Complete monthly financial statement
            with filters.
          </p>
        </div>

        <div
          style={styles.quickCard}
          onClick={() => navigate("/ledger-master")}
        >
          <h2>📒 Ledger Book</h2>

          <p>
            Professional ledger management &
            balance tracking.
          </p>
        </div>

      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="card">

        <div className="card-title">
          Recent Transactions
        </div>

        {transactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          transactions.slice(0, 10).map((t) => {

            const isIncome =
              t.type === "income" ||
              t.subType === "asset";

            return (
              <div
                key={t._id}
                style={styles.transactionRow}
              >

                {/* LEFT */}
                <div>

                  <div style={{ fontWeight: 700 }}>
                    {t.note || t.category || t.type}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.6,
                    }}
                  >
                    {new Date(t.date).toLocaleDateString()}
                  </div>

                </div>

                {/* RIGHT */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >

                  <strong
                    style={{
                      color: isIncome ? "green" : "red",
                    }}
                  >
                    ₹ {toNumber(t.amount).toFixed(2)}
                  </strong>

                  <button
                    className="btn"
                    onClick={() =>
                      navigate(`/edit/${t._id}`)
                    }
                  >
                    Edit
                  </button>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* CATEGORY BREAKDOWN */}
      <div style={styles.bottomGrid}>

        {/* EXPENSE BREAKDOWN */}
        <div className="card">

          <div className="card-title">
            Expense Breakdown
          </div>

          <div className="list">

            {categoryPairs.length === 0 ? (
              <div className="list-item">
                <span>No expense data</span>
                <strong>₹ 0</strong>
              </div>
            ) : (
              categoryPairs.slice(0, 10).map(([key, value]) => (
                <div
                  className="list-item"
                  key={key}
                >
                  <span
                    style={{
                      textTransform: "capitalize",
                    }}
                  >
                    {key}
                  </span>

                  <strong>
                    ₹ {value.toFixed(2)}
                  </strong>
                </div>
              ))
            )}

          </div>

        </div>

        {/* HEALTH */}
        <div className="card">

          <div className="card-title">
            Financial Health
          </div>

          <div className="list">

            <div className="list-item">
              <span>Saving Rate</span>

              <strong>
                {income > 0
                  ? `${((net / income) * 100).toFixed(1)}%`
                  : "0%"}
              </strong>
            </div>

            <div className="list-item">
              <span>Expense Ratio</span>

              <strong>
                {income > 0
                  ? `${((expense / income) * 100).toFixed(1)}%`
                  : "0%"}
              </strong>
            </div>

            <div className="list-item">
              <span>Loan Balance</span>

              <strong>
                ₹ {(asset - liability).toFixed(2)}
              </strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/* SUMMARY CARD */
function SummaryCard({
  title,
  value,
  color,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.card,
        borderLeft: `6px solid ${color}`,
      }}
    >

      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 20,
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 42,
          fontWeight: "bold",
        }}
      >
        ₹ {Number(value || 0).toFixed(2)}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 13,
          opacity: 0.6,
        }}
      >
        Click to view details →
      </div>

    </div>
  );
}

/* STYLES */
const styles = {

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(300px,1fr))",
    gap: 20,
    marginBottom: 30,
  },

  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 25,
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",
    gap: 20,
    marginBottom: 30,
  },

  quickCard: {
    background: "#fff",
    padding: 25,
    borderRadius: 20,
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(350px,1fr))",
    gap: 20,
    marginTop: 20,
  },

  transactionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #eee",
  },

};
