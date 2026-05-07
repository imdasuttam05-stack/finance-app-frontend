import React, { useEffect, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function LedgerMaster() {
  const [name, setName] = useState("");
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  // 📥 LOAD LEDGERS
  const load = async () => {
    try {
      setLoading(true);

      const [personsRes, transactionsRes] = await Promise.all([
        API.get("/persons"),
        API.get("/transactions"),
      ]);

      const personsData = personsRes.data || [];
      const transactions = transactionsRes.data || [];

      // 💰 BALANCE CALCULATION
      const updated = personsData.map((p) => {
        const ledgerTx = transactions.filter(
          (t) => t.personId?._id === p._id
        );

        let credit = 0;
        let debit = 0;

        ledgerTx.forEach((t) => {
          const amount = Number(t.amount || 0);

          if (t.type === "income" || t.subType === "asset") {
            credit += amount;
          } else {
            debit += amount;
          }
        });

        return {
          ...p,
          balance: credit - debit,
        };
      });

      setPersons(updated);

    } catch (err) {
      console.error(err);
      alert("Failed to load ledger list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ➕ CREATE LEDGER
  const createLedger = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      return alert("Enter ledger name");
    }

    const exists = persons.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      return alert("Ledger already exists");
    }

    try {
      setSaving(true);

      await API.post("/persons", { name: trimmed });

      setName("");
      load();

    } catch (err) {
      console.error(err);
      alert("Failed to create ledger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-header">
        <h1>📒 Ledger Master</h1>
        <p>Create and manage your ledger accounts</p>
      </div>

      {/* CREATE */}
      <div className="card">
        <div className="card-title">Create Ledger</div>

        <div className="form">
          <input
            className="input"
            placeholder="Enter ledger name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className="btn"
            onClick={createLedger}
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Ledger"}
          </button>
        </div>
      </div>

      {/* LEDGER LIST */}
      <div className="card">
        <div className="card-title">All Ledgers</div>

        {loading ? (
          <div className="list-item">Loading...</div>
        ) : persons.length === 0 ? (
          <div className="list-item">No ledger found</div>
        ) : (
          <div className="list">
            {persons.map((p) => (
              <div
                key={p._id}
                className="list-item"
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 10px",
                  borderBottom: "1px solid #eee",
                }}
                onClick={() => navigate(`/ledger/${p._id}`)}
              >

                {/* NAME */}
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {p.name}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.6,
                    }}
                  >
                    Click to open ledger
                  </div>
                </div>

                {/* BALANCE */}
                <div
                  style={{
                    color: p.balance >= 0 ? "green" : "red",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  ₹ {Math.abs(p.balance).toFixed(2)}

                  <div style={{ fontSize: 12 }}>
                    {p.balance >= 0 ? "পাবো" : "দেবো"}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
