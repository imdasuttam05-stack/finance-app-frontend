  import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function AddTransaction() {
  const [persons, setPersons] = useState([]);
  const [saving, setSaving] = useState(false);
  const [previousEntries, setPreviousEntries] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [savedLedger, setSavedLedger] = useState(null);

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

  // 🔄 LOAD LEDGERS
  useEffect(() => {
    API.get("/persons")
      .then((res) => setPersons(res.data || []))
      .catch(() => setPersons([]));
  }, []);

  // 🔄 FETCH PREVIOUS ENTRIES FOR SELECTED LEDGER
  useEffect(() => {
    if (
      !form.person ||
      !["payment", "received"].includes(form.type)
    ) {
      setPreviousEntries([]);
      return;
    }

    API.get(`/ledger/${form.person}`)
      .then((res) => setPreviousEntries(res.data || []))
      .catch(() => setPreviousEntries([]));
  }, [form.person, form.type]);

  // 🔄 TYPE CHANGE RESET
  const handleTypeChange = (value) => {
    setForm({
      type: value,
      category: "",
      subCategory: "",
      subType: "",
      amount: "",
      note: "",
      person: "",
      againstId: "",
      date: form.date,
    });
  };

  const sendTransactionSms = async (ledger, transaction) => {
    if (!ledger?.mobile) return;

    try {
      await API.post("/send-sms", {
        phoneNumber: ledger.mobile,
        ledgerName: ledger.name,
        date: transaction.date,
        type: transaction.type,
        amount: transaction.amount,
        note: transaction.note || "-",
      });
    } catch (err) {
      console.error("SMS send failed:", err);
    }
  };

  // 💾 SUBMIT
  const submit = async () => {
    try {
      if (
        ["loan", "investment", "payment", "received"].includes(form.type) &&
        !form.person
      ) {
        alert("Please select a ledger before saving this transaction.");
        return;
      }

      setSaving(true);

      const {
        person,
        againstId,
        ...rest
      } = form;

      const payload = {
        ...rest,
        amount: Number(form.amount || 0),
        personId: person || null,
        againstId: againstId || null,
      };

      await API.post("/transactions", payload);

      const selectedPerson = persons.find((p) => p._id === person);
      if (person) {
        const ledgerInfo = {
          id: person,
          name: selectedPerson?.name || "Selected ledger",
          mobile: selectedPerson?.mobile || "",
        };

        setSavedLedger(ledgerInfo);
        setSaveMessage(
          `Saved successfully. Open ${ledgerInfo.name} ledger.`
        );

        await sendTransactionSms(ledgerInfo, {
          date: payload.date,
          type: payload.type,
          amount: payload.amount,
          note: payload.note || "",
        });
      } else {
        setSavedLedger(null);
        setSaveMessage("Saved successfully.");
      }

      setForm({
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
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>Add Transaction</h1>
          <p>Income, Expense, Loan & Investment entry</p>
        </div>
        <span className="pill">{saving ? "Saving…" : "Ready"}</span>
      </div>

      <div className="card">
        <div className="card-title">Entry Details</div>

        <div className="grid">

          {/* TYPE */}
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

          {/* DATE */}
          <div className="field" style={{ gridColumn: "span 4" }}>
            <div className="label">Date</div>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />
          </div>

          {/* INCOME */}
          {form.type === "income" && (
            <div className="field" style={{ gridColumn: "span 4" }}>
              <div className="label">Income Category</div>
              <select
                className="select"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option value="">Select</option>
                {incomeCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* EXPENSE */}
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
                  onChange={(e) =>
                    setForm({ ...form, subCategory: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  {expenseCategories[form.category]?.map((sub) => (
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
                <div className="label">Loan Type</div>
                <select
                  className="select"
                  value={form.subType}
                  onChange={(e) =>
                    setForm({ ...form, subType: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="asset">Given</option>
                  <option value="liability">Taken</option>
                </select>
              </div>
            </>
          )}

          {/* PAYMENT / RECEIVED */}
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
                    <option key={p._id} value={p._id}>
                      {p.name}{p.mobile ? ` • ${p.mobile}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ gridColumn: "span 4" }}>
                <div className="label">Against entry</div>
                <select
                  className="select"
                  value={form.againstId}
                  onChange={(e) =>
                    setForm({ ...form, againstId: e.target.value })
                  }
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

          {/* INVESTMENT */}
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
                  onChange={(e) =>
                    setForm({ ...form, subType: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  {investmentTypes.map((inv) => (
                    <option key={inv} value={inv}>{inv}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* AMOUNT */}
          <div className="field" style={{ gridColumn: "span 4" }}>
            <div className="label">Amount</div>
            <input
              className="input"
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
            />
          </div>

        </div>

        {/* NOTE */}
        <div className="field">
          <div className="label">Note</div>
          <textarea
            className="textarea"
            value={form.note}
            onChange={(e) =>
              setForm({ ...form, note: e.target.value })
            }
          />
        </div>

        {/* BUTTON */}
        <button className="btn" onClick={submit} disabled={saving}>
          {saving ? "Saving…" : "Save Transaction"}
        </button>

        {saveMessage && (
          <div
            style={{
              marginTop: 12,
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #a7f3d0",
              background: "#ecfdf3",
              color: "#166534",
            }}
          >
            <div>{saveMessage}</div>
            {savedLedger && (
              <div style={{ marginTop: 8 }}>
                <Link
                  to={`/ledger/${savedLedger.id}`}
                  style={{ fontWeight: 700, color: "#2563eb" }}
                >
                  Open ledger: {savedLedger.name} (ID: {savedLedger.id})
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
