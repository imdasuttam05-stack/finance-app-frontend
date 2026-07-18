import React, { useEffect, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [deleting, setDeleting] = useState("");

  const navigate = useNavigate();

  const deleteTransaction = async (id) => {
    const confirmed = window.confirm(
      "Delete this transaction permanently?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);

      await API.delete(`/transactions/${id}`);

      setTransactions((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error("Delete failed", err);

      alert(
        err.response?.data?.error ||
          "Failed to delete transaction"
      );
    } finally {
      setDeleting("");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [
          summaryRes,
          categoryRes,
          txnRes,
        ] = await Promise.all([
          API.get("/transactions/summary"),
          API.get("/transactions/category-summary"),
          API.get("/transactions"),
        ]);

        if (!isMounted) return;

        setSummary(summaryRes?.data || {});
        setCategoryData(categoryRes?.data || {});
        setTransactions(txnRes?.data || []);
      } catch (err) {
        console.error(
          "Dashboard load error:",
          err
        );

        if (!isMounted) return;

        setSummary({});
        setCategoryData({});
        setTransactions([]);
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

  const categoryPairs = Object.entries(
    categoryData || {}
  )
    .map(([key, value]) => [
      key,
      toNumber(value),
    ])
    .filter(([, value]) => value !== 0)
    .sort((a, b) => b[1] - a[1]);

  const username =
    localStorage.getItem("username") || "User";

  return (
    <div className="page dashboard-page">

      {/* ================= HEADER ================= */}

      <div className="page-header dashboard-header">

        <div className="dashboard-title">

          <div className="dashboard-icon">
            📊
          </div>

          <div>
            <h1>Dashboard</h1>

            <p>
              Professional finance overview
            </p>
          </div>

        </div>

        <div className="dashboard-header-right">

          <button
            className="btn small add-transaction-btn"
            onClick={() =>
              navigate("/transactions/new")
            }
          >
            + Add Transaction
          </button>

          <div className="welcome-user">

            <div className="welcome-text">
              <div className="welcome-title">
                Welcome back
              </div>

              <div className="welcome-subtitle">
                {username}
              </div>
            </div>

            <button
              className="topnav-userBtn"
              onClick={() =>
                navigate("/profile")
              }
            >
              <div className="topnav-avatar">
                {username
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </button>

          </div>

        </div>

      </div>


      {/* ================= SUMMARY CARDS ================= */}

      <div className="summary-grid">

        <SummaryCard
          title="Income"
          value={income}
          color="#16a34a"
          onClick={() =>
            navigate("/report/income")
          }
        />

        <SummaryCard
          title="Expense"
          value={expense}
          color="#dc2626"
          onClick={() =>
            navigate("/report/expense")
          }
        />

        <SummaryCard
          title="Net"
          value={net}
          color="#2563eb"
          onClick={() =>
            navigate("/report/net")
          }
        />

        <SummaryCard
          title="Investment"
          value={investment}
          color="#7c3aed"
          onClick={() =>
            navigate("/report/investment")
          }
        />

        <SummaryCard
          title="Asset"
          value={asset}
          color="#16a34a"
          onClick={() =>
            navigate("/report/asset")
          }
        />

        <SummaryCard
          title="Liability"
          value={liability}
          color="#dc2626"
          onClick={() =>
            navigate("/report/liability")
          }
        />

      </div>


      {/* ================= QUICK REPORTS ================= */}

      <div className="quick-grid">

        <div
          className="quick-card"
          onClick={() =>
            navigate("/daybook")
          }
        >
          <h2>📘 Day Book</h2>

          <p>
            Full daily transaction report
            with edit & delete actions.
          </p>
        </div>


        <div
          className="quick-card"
          onClick={() =>
            navigate("/monthly")
          }
        >
          <h2>📅 Monthly Report</h2>

          <p>
            Complete monthly financial
            statement with filters.
          </p>
        </div>


        <div
          className="quick-card"
          onClick={() =>
            navigate("/ledger-master")
          }
        >
          <h2>📒 Ledger Book</h2>

          <p>
            Professional ledger management
            & balance tracking.
          </p>
        </div>

      </div>


      {/* ================= RECENT TRANSACTIONS ================= */}

      <div className="card transactions-card">

        <div className="card-title">
          Recent Transactions
        </div>

        {transactions.length === 0 ? (

          <p className="empty-state">
            No transactions found
          </p>

        ) : (

          <div className="transactions-list">

            {transactions
              .slice(0, 10)
              .map((t) => {

                const isIncome =
                  t.type === "income" ||
                  t.subType === "asset";

                return (

                  <div
                    key={t._id}
                    className="transaction-row"
                  >

                    <div className="transaction-info">

                      <div className="transaction-name">
                        {t.note ||
                          t.category ||
                          t.type}
                      </div>

                      <div className="transaction-date">
                        {new Date(
                          t.date
                        ).toLocaleDateString()}
                      </div>

                    </div>


                    <div className="transaction-right">

                      <strong
                        className={
                          isIncome
                            ? "transaction-income"
                            : "transaction-expense"
                        }
                      >
                        ₹{" "}
                        {toNumber(
                          t.amount
                        ).toFixed(2)}
                      </strong>


                      <div className="action-buttons">

                        <button
                          className="btn secondary"
                          onClick={() =>
                            navigate(
                              `/edit/${t._id}`
                            )
                          }
                        >
                          Edit
                        </button>


                        <button
                          className="btn danger"
                          onClick={() =>
                            deleteTransaction(
                              t._id
                            )
                          }
                          disabled={
                            deleting === t._id
                          }
                        >
                          {deleting === t._id
                            ? "Deleting…"
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  </div>

                );
              })}

          </div>

        )}

      </div>


      {/* ================= BOTTOM SECTION ================= */}

      <div className="bottom-grid">

        {/* EXPENSE BREAKDOWN */}

        <div className="card">

          <div className="card-title">
            Expense Breakdown
          </div>

          <div className="list">

            {categoryPairs.length === 0 ? (

              <div className="list-item">
                <span>
                  No expense data
                </span>

                <strong>
                  ₹ 0
                </strong>
              </div>

            ) : (

              categoryPairs
                .slice(0, 10)
                .map(([key, value]) => (

                  <div
                    className="list-item"
                    key={key}
                  >

                    <span
                      style={{
                        textTransform:
                          "capitalize",
                      }}
                    >
                      {key}
                    </span>

                    <strong>
                      ₹{" "}
                      {value.toFixed(2)}
                    </strong>

                  </div>

                ))

            )}

          </div>

        </div>


        {/* FINANCIAL HEALTH */}

        <div className="card">

          <div className="card-title">
            Financial Health
          </div>

          <div className="list">

            <div className="list-item">

              <span>
                Saving Rate
              </span>

              <strong>
                {income > 0
                  ? `${(
                      (net / income) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </strong>

            </div>


            <div className="list-item">

              <span>
                Expense Ratio
              </span>

              <strong>
                {income > 0
                  ? `${(
                      (expense / income) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </strong>

            </div>


            <div className="list-item">

              <span>
                Loan Balance
              </span>

              <strong>
                ₹{" "}
                {(
                  asset - liability
                ).toFixed(2)}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
  color,
  onClick,
}) {
  return (

    <div
      className="summary-card"
      onClick={onClick}
      style={{
        borderLeft:
          `5px solid ${color}`,
      }}
    >

      <div className="summary-card-title">
        {title}
      </div>

      <div className="summary-card-value">
        ₹{" "}
        {Number(value || 0).toFixed(2)}
      </div>

      <div className="summary-card-link">
        Click to view details →
      </div>

    </div>

  );
}
