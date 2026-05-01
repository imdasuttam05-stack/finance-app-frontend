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
      const res = await API.get("/persons");
      setPersons(res.data || []);
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

    // 🔥 duplicate check frontend side
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
      console.error("CREATE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to create ledger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">

      <div className="page-header">
        <h1>📒 Ledger Master</h1>
        <p>Create and manage your ledger accounts</p>
      </div>

      {/* ➕ CREATE */}
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

      {/* 📋 LIST */}
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
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/ledger/${p._id}`)}
              >
                <span>{p.name}</span>
                <strong>→ Open</strong>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}