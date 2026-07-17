import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../api";
import { getEligibleAgainstEntries } from "../utils/transactionUtils";

const expenseCategories = {
  food: ["groceries", "restaurant", "snacks"],
  transport: ["fuel", "bus", "cab"],
  shopping: ["clothes", "electronics"],
  bills: ["electricity", "internet"],
  entertainment: ["movies", "ott"],
  healthcare: ["doctor", "medicine"],
  others: ["misc"],
};

const incomeCategories = ["salary", "business", "gift", "interest", "other"];
const investmentTypes = ["FD", "SIP", "Stocks", "Crypto", "Gold"];
const today = new Date().toISOString().slice(0, 10);

export default function EditTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [persons, setPersons] = useState([]);
  const [previousEntries, setPreviousEntries] = useState([]);
  const [form, setForm] = useState({
    type: "income",
    category: "",
    subCategory: "",
    subType: "",
    amount: "",
    note: "",
    person: "",
    againstId: "",
    date: today,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/persons")
      .then((res) => setPersons(res.data || []))
      .catch(() => setPersons([]));
  }, []);

  useEffect(() => {
    if (!form.person || !["payment", "received"].includes(form.type)) {
      setPreviousEntries([]);
      return;
    }

    API.get(`/ledger/${form.person}`)
      .then((res) => setPreviousEntries(res.data || []))
      .catch(() => setPreviousEntries([]));
  }, [form.person, form.type]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    API.get(`/transactions/${id}`)
      .then((res) => {
        const t = res.data || {};

        setForm({
          type: t.type || "income",
          category: t.category || "",
          subCategory: t.subCategory || "",
          subType: t.subType || "",
          amount: t.amount || "",
          note: t.note || "",
          person: t.personId?._id || t.personId || "",
          againstId: t.againstId?._id || t.againstId || "",
          date: t.date ? new Date(t.date).toISOString().slice(0, 10) : today,
        });
      })
      .catch((err) => {
        console.error("Failed to load transaction", err);
        alert("Unable to load transaction data");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleTypeChange = (value) => {
    setForm({
      type: value,
      category: "",
      subCategory: "",
      subType: "",
      amount: form.amount,
      note: form.note,
      person: "",
      againstId: "",
      date: form.date,
    });
  };

  const submit = async () => {
    try {
      if (
        ["loan", "investment", "payment", "received"].includes(form.type) &&
        !form.person
      ) {
        alert("Please select a ledger before updating this transaction.");
        return;
      }

      setSaving(true);
      const { person, againstId, ...rest } = form;
      const payload = {
        ...rest,
        amount: Number(form.amount || 0),
        personId: person || null,
        againstId: againstId || null,
      };

      await API.put(`/transactions/${id}`, payload);
      alert("Transaction updated successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Edit Transaction</h1>
          <p>Update the selected entry and save changes</p>
        </div>
        <span className="pill">{loading ? "Loading..." : "Ready"}</span>
      </div>

      <div className="card">
        <div className="card-title">Transaction Details</div>

        {loading ? (
          <p>Loading transaction...</p>
        ) : (
          <>
            <div className="grid">
              <div className="field" style={{ gridColumn: "span 4" }}>
                <div className="label">Type</div>
                <select
                  className="select"
                  value={form.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="loan">Loan</option>
                  <option value="investment">Investment</option>
                  <option value="payment">Payment</option>
                  <option value="received">Received</option>
                </select>
              </div>

              <div className="field" style={{ gridColumn: "span 4" }}>
                <div className="label">Date</div>
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              {form.type === "income" && (
                <div className="field" style={{ gridColumn: "span 4" }}>
                  <div className="label">Income Category</div>
                  <select
                    className="select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Select</option>
                    {incomeCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.type === "expense" && (
                <>
                  <div className="field" style={{ gridColumn: "span 4" }}>
                    <div className="label">Expense Category</div>
                    <select
                      className="select"
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value,
                          subCategory: "",
                        })
                      }
                    >
                      <option value="">Select</option>
                      {Object.keys(expenseCategories).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field" style={{ gridColumn: "span 4" }}>
                    <div className="label">Sub Category</div>
                    <select
                      className="select"
                      value={form.subCategory}
                      disabled={!form.category}
                      onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                    >
                      <option value="">Select</option>
                      {expenseCategories[form.category]?.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {form.type === "loan" && (
                <>
                  <div className="field" style={{ gridColumn: "span 4" }}>
                    <div className="label">Ledger</div>
                    <select
                      className="select"
                      value={form.person}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          person: e.target.value,
                          againstId: "",
                        })
                      }
                    >
                      <option value="">Select Ledger</option>
                      {persons.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}{p.mobile ? ` • ${p.mobile}` : ""}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field" style={{ gridColumn: "span 4" }}>
                    <div className="label">Loan Type</div>
                    <select
                      className="select"
                      value={form.subType}
                      onChange={(e) => setForm({ ...form, subType: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="asset">Given</option>
                      <option value="liability">Taken</option>
                    </select>
                  </div>
                </>
              )}

              {['payment', 'received'].includes(form.type) && (
                <>
                  <div className="field" style={{ gridColumn: "span 4" }}>
                    <div className="label">Ledger</div>
                    <select
                      className="select"
                      value={form.person}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          person: e.target.value,
                          againstId: "",
                        })
                      }
                    >
                      <option value="">Select Ledger</option>
                      {persons.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}{p.mobile ? ` • ${p.mobile}` : ""}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field" style={{ gridColumn: "span 4" }}>
                    <div className="label">Against entry</div>
                    <select
                      className="select"
                      value={form.againstId}
                      onChange={(e) => setForm({ ...form, againstId: e.target.value })}
                    >
                      <option value="">No against entry</option>
                      {getEligibleAgainstEntries(previousEntries, form.type, form.againstId).map((entry) => (
                        <option key={entry._id} value={entry._id}>
                          {new Date(entry.date).toLocaleDateString()} — ₹{entry.amount} — {entry.note || entry.category || entry.type}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {form.type === "investment" && (
                <>
                  <div className="field" style={{ gridColumn: "span 4" }}>
                    <div className="label">Ledger</div>
                    <select
                      className="select"
                      value={form.person}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          person: e.target.value,
                          againstId: "",
                        })
                      }
                    >
                      <option value="">Select Ledger</option>
                      {persons.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}{p.mobile ? ` • ${p.mobile}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field" style={{ gridColumn: "span 4" }}>
                    <div className="label">Investment Type</div>
                    <select
                      className="select"
                      value={form.subType}
                      onChange={(e) => setForm({ ...form, subType: e.target.value })}
                    >
                      <option value="">Select</option>
                      {investmentTypes.map((inv) => (
                        <option key={inv} value={inv}>{inv}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="field" style={{ gridColumn: "span 4" }}>
                <div className="label">Amount</div>
                <input
                  className="input"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <div className="label">Note</div>
              <textarea
                className="textarea"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <button className="btn" onClick={submit} disabled={saving}>
              {saving ? "Updating…" : "Update Transaction"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
