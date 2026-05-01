import { useEffect, useState } from "react";
import { API } from "../api";
import { useParams } from "react-router-dom";

export default function LedgerPage() {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [person, setPerson] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 Load ledger
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    API.get(`/ledger/${id}`, { params: { date } })
      .then((res) => {
        setData(res.data || []);
        if (res.data?.length > 0) {
          setPerson(res.data[0]?.personId?.name || "Ledger");
        }
      })
      .catch(() => {
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [id, date]);

  // 💰 Calculate balance
  const totalCredit = data
    .filter((t) => t.type === "income" || t.subType === "asset")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalDebit = data
    .filter((t) => t.type === "expense" || t.subType === "liability")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = totalCredit - totalDebit;

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>📒 {person || "Ledger"}</h1>
          <p>Ledger details & transactions</p>
        </div>

        <input
          type="date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* SUMMARY */}
      <div className="grid" style={{ marginBottom: 15 }}>
        <Card title="Credit" value={totalCredit} color="green" />
        <Card title="Debit" value={totalDebit} color="red" />
        <Card title="Balance" value={balance} color="#2563eb" />
      </div>

      {/* LIST */}
      <div className="card">
        <h3>Transactions</h3>

        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          data.map((t) => (
            <div key={t._id} style={styles.row}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {t.note || t.type}
                </div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  {t.date || "No date"}
                </div>
              </div>

              <div
                style={{
                  color:
                    t.type === "income" || t.subType === "asset"
                      ? "green"
                      : "red",
                  fontWeight: "bold",
                }}
              >
                ₹ {t.amount}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

/* 🔹 CARD COMPONENT */
function Card({ title, value, color }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <p>{title}</p>
      <h2 style={{ color }}>₹ {value.toFixed(2)}</h2>
    </div>
  );
}

/* 🎨 STYLE */
const styles = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
};