import { useEffect, useState } from "react";
import { API } from "../api";
import { useParams } from "react-router-dom";

export default function LedgerPage() {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [person, setPerson] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(true);

  // LOAD LEDGER
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    API.get(`/ledger/${id}`)
      .then((res) => {

        let list = res.data || [];

        // FILTER FROM DATE
        if (fromDate) {
          list = list.filter(
            (t) => new Date(t.date) >= new Date(fromDate)
          );
        }

        // FILTER TO DATE
        if (toDate) {
          list = list.filter(
            (t) => new Date(t.date) <= new Date(toDate)
          );
        }

        setData(list);

        if (list.length > 0) {
          setPerson(list[0]?.personId?.name || "Ledger");
        }

      })
      .catch((err) => {
        console.error(err);
        setData([]);
      })
      .finally(() => setLoading(false));

  }, [id, fromDate, toDate]);

  // TOTAL CREDIT
  const totalCredit = data
    .filter((t) => t.type === "income" || t.subType === "asset")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // TOTAL DEBIT
  const totalDebit = data
    .filter((t) => t.type === "expense" || t.subType === "liability")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // BALANCE
  const balance = totalCredit - totalDebit;

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-header">

        <div>
          <h1>📒 {person || "Ledger"}</h1>
          <p>Full Ledger Details & Transactions</p>
        </div>

        {/* DATE FILTER */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <input
            type="date"
            className="input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

      </div>

      {/* SUMMARY */}
      <div
        className="grid"
        style={{
          marginBottom: 15,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 10,
        }}
      >
        <Card title="Receivable" value={totalCredit} color="green" />
        <Card title="Payable" value={totalDebit} color="red" />
        <Card title="Balance" value={balance} color="#2563eb" />
      </div>

      {/* TRANSACTIONS */}
      <div className="card">

        <h3 style={{ marginBottom: 15 }}>
          Transactions
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          data.map((t) => {

            const isCredit =
              t.type === "income" ||
              t.subType === "asset";

            return (
              <div
                key={t._id}
                style={styles.row}
              >

                {/* LEFT */}
                <div>

                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {t.note || t.category || t.type}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                    }}
                  >
                    {new Date(t.date).toLocaleDateString()}
                  </div>

                </div>

                {/* RIGHT */}
                <div
                  style={{
                    color: isCredit ? "green" : "red",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {isCredit ? "+" : "-"} ₹{" "}
                  {Number(t.amount || 0).toFixed(2)}
                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div
      className="card"
      style={{
        textAlign: "center",
        padding: 20,
      }}
    >
      <p
        style={{
          opacity: 0.7,
          marginBottom: 10,
        }}
      >
        {title}
      </p>

      <h2 style={{ color }}>
        ₹ {Number(value || 0).toFixed(2)}
      </h2>
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #eee",
  },
};
