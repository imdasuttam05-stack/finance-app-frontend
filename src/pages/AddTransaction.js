import React, { useState } from "react";
import { API } from "../api";

const categories = {
  food: ["groceries", "restaurant", "snacks"],
  transport: ["fuel", "bus", "cab"],
  shopping: ["clothes", "electronics"],
  bills: ["electricity", "internet"],
  entertainment: ["movies", "ott"],
  healthcare: ["doctor", "medicine"],
  others: ["misc"],
};

export default function AddTransaction() {
  const [form, setForm] = useState({
    type: "income",
    category: "",
    subCategory: "",
    subType: "",
    amount: "",
    note: "",
    person: "", // 🔥 NEW
  });

  const [saving, setSaving] = useState(false);

  const submit = async () => {
    try {
      setSaving(true);
      await API.post("/transactions", form);
      alert("Saved");

      setForm({
        type: "income",
        category: "",
        subCategory: "",
        subType: "",
        amount: "",
        note: "",
        person: "", // reset
      });
    } catch (err) {
      console.error("Failed to save transaction:", err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Add Transaction</h1>
          <p>Create a new entry with type, amount, and optional note.</p>
        </div>
        <span className="pill">{saving ? "Saving…" : "Form ready"}</span>
      </div>

      <div className="card">
        <div className="card-title">Entry Details</div>

        <div className="form" style={{ marginTop: 12 }}>
          <div className="grid">

            {/* TYPE */}
            <div className="field" style={{ gridColumn: "span 4" }}>
              <div className="label">Type</div>
              <select
                className="select"
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                    category: "",
                    subCategory: "",
                    subType: "",
                  })
                }
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="investment">Investment</option>
                <option value="loan">Loan</option>
              </select>
            </div>

            {/* EXPENSE CATEGORY */}
            {form.type === "expense" && (
              <>
                <div className="field" style={{ gridColumn: "span 4" }}>
                  <div className="label">Category</div>
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
                    <option value="">Select Category</option>
                    {Object.keys(categories).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="field" style={{ gridColumn: "span 4" }}>
                  <div className="label">Subcategory</div>
                  <select
                    className="select"
                    value={form.subCategory}
                    onChange={(e) =>
                      setForm({ ...form, subCategory: e.target.value })
                    }
                    disabled={!form.category}
                  >
                    <option value="">Select SubCategory</option>
                    {categories[form.category]?.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* LOAN */}
            {form.type === "loan" && (
              <>
                <div className="field" style={{ gridColumn: "span 4" }}>
                  <div className="label">Loan Direction</div>
                  <select
                    className="select"
                    value={form.subType}
                    onChange={(e) =>
                      setForm({ ...form, subType: e.target.value })
                    }
                  >
                    <option value="">Asset / Liability</option>
                    <option value="asset">You Gave (Will Receive)</option>
                    <option value="liability">You Took (Have to Pay)</option>
                  </select>
                </div>

                {/* 🔥 NEW PERSON FIELD */}
                <div className="field" style={{ gridColumn: "span 4" }}>
                  <div className="label">Person Name</div>
                  <input
                    className="input"
                    placeholder="e.g. Ram / Shyam"
                    value={form.person}
                    onChange={(e) =>
                      setForm({ ...form, person: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            {/* AMOUNT */}
            <div className="field" style={{ gridColumn: "span 4" }}>
              <div className="label">Amount</div>
              <input
                className="input"
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* NOTE */}
          <div className="field">
            <div className="label">Note (optional)</div>
            <textarea
              className="textarea"
              placeholder="Add a short note..."
              value={form.note}
              onChange={(e) =>
                setForm({ ...form, note: e.target.value })
              }
            />
          </div>

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>

            <button
              className="btn secondary"
              type="button"
              onClick={() =>
                setForm({
                  type: "income",
                  category: "",
                  subCategory: "",
                  subType: "",
                  amount: "",
                  note: "",
                  person: "",
                })
              }
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}