import {
  useEffect,
  useState,
} from "react";

import { API } from "../api";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

export default function LedgerPage() {

  const { id } = useParams();

  const [data, setData] =
    useState([]);

  const [person, setPerson] =
    useState("");

  const [fromDate,
    setFromDate] =
    useState("");

  const [toDate,
    setToDate] =
    useState("");

  const [loading,
    setLoading] =
    useState(true);
  const navigate = useNavigate();
  const [deleting,
    setDeleting] =
    useState("");

  // ======================
  // LOAD LEDGER
  // ======================
  useEffect(() => {

    if (!id) return;

    setLoading(true);

    API.get(`/ledger/${id}`)

      .then((res) => {

        let list =
          res.data || [];

        // DATE FILTER
        if (fromDate) {

          list = list.filter(
            (t) =>
              new Date(t.date)
              >= new Date(fromDate)
          );

        }

        if (toDate) {

          list = list.filter(
            (t) =>
              new Date(t.date)
              <= new Date(toDate)
          );

        }

        // SORT ASC
        list.sort(
          (a, b) =>
            new Date(a.date)
            - new Date(b.date)
        );

        // RUNNING BALANCE
        let running = 0;

        list = list.map((t) => {

          let drcr = "DR";

          // RECEIVED = CR
          if (
            t.type === "received"
          ) {

            running -=
              Number(
                t.amount || 0
              );

            drcr = "CR";

          }

          // PAYMENT = DR
          else if (
            t.type === "payment"
          ) {

            running +=
              Number(
                t.amount || 0
              );

            drcr = "DR";

          }

          // INCOME
          else if (
            t.type === "income"
          ) {

            running -=
              Number(
                t.amount || 0
              );

            drcr = "CR";

          }

          // EXPENSE
          else {

            running +=
              Number(
                t.amount || 0
              );

            drcr = "DR";

          }

          return {

            ...t,

            drcr,

            runningBalance:
              Math.abs(
                running
              ),

            balanceType:
              running >= 0
                ? "DR"
                : "CR",

          };

        });

        setData(list);

        if (
          list.length > 0
        ) {

          setPerson(

            list[0]
              ?.personId
              ?.name

            || "Ledger"

          );

        }

      })

      .catch((err) => {

        console.error(err);

        setData([]);

      })

      .finally(() =>
        setLoading(false)
      );

  }, [
    id,
    fromDate,
    toDate,
  ]);

  // ======================
  // TOTAL DR
  // ======================
  const totalDebit =
    data

      .filter(
        (t) =>
          t.drcr === "DR"
      )

      .reduce(
        (sum, t) =>
          sum +
          Number(
            t.amount || 0
          ),
        0
      );

  // ======================
  // TOTAL CR
  // ======================
  const totalCredit =
    data

      .filter(
        (t) =>
          t.drcr === "CR"
      )

      .reduce(
        (sum, t) =>
          sum +
          Number(
            t.amount || 0
          ),
        0
      );

  const deleteEntry = async (id) => {
    const confirmed = window.confirm(
      "Delete this ledger transaction?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);
      await API.delete(`/transactions/${id}`);
      setData((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert(err.response?.data?.error || "Delete failed");
    } finally {
      setDeleting("");
    }
  };

  // ======================
  // FINAL BALANCE
  // ======================
  const finalBalance =
    totalDebit -
    totalCredit;

  return (

    <div className="page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1>
            📒 {person}
          </h1>

          <p>
            Full Ledger
            Statement
          </p>

        </div>

        {/* DATE FILTER */}

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap:
              "wrap",
          }}
        >

          <input
            type="date"

            className="input"

            value={fromDate}

            onChange={(e) =>
              setFromDate(
                e.target.value
              )
            }
          />

          <input
            type="date"

            className="input"

            value={toDate}

            onChange={(e) =>
              setToDate(
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* SUMMARY */}

      <div
        className="grid"

        style={{
          marginBottom: 15,

          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",

          gap: 10,
        }}
      >

        <Card
          title="Total DR"
          value={totalDebit}
          color="red"
        />

        <Card
          title="Total CR"
          value={totalCredit}
          color="green"
        />

        <Card
          title="Balance"
          value={
            Math.abs(
              finalBalance
            )
          }
          extra={
            finalBalance >= 0
              ? "DR"
              : "CR"
          }
          color="#2563eb"
        />

      </div>

      {/* TABLE */}

      <div className="card">

        <h3
          style={{
            marginBottom: 15,
          }}
        >
          Transactions
        </h3>

        {loading ? (

          <p>
            Loading...
          </p>

        ) : data.length === 0 ? (

          <p>
            No transactions
            found
          </p>

        ) : (

          <div
            style={{
              overflowX:
                "auto",
            }}
          >

            <table
              style={{
                width: "100%",

                borderCollapse:
                  "collapse",
              }}
            >

              <thead>

                <tr>

                  <th style={styles.th}>
                    Date
                  </th>

                  <th style={styles.th}>
                    Details
                  </th>

                  <th style={styles.th}>
                    DR
                  </th>

                  <th style={styles.th}>
                    CR
                  </th>

                  <th style={styles.th}>
                    Balance
                  </th>

                  <th style={styles.th}>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {data.map(
                  (t) => (

                    <tr
                      key={t._id}
                    >

                      <td
                        style={
                          styles.td
                        }
                      >

                        {
                          new Date(
                            t.date
                          )
                          .toLocaleDateString()
                        }

                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >

                        <div
                          style={{
                            fontWeight:
                              700,
                          }}
                        >

                          {t.note
                            || t.category
                            || t.type}

                        </div>

                        <div
                          style={{
                            fontSize:
                              12,

                            opacity:
                              0.7,
                          }}
                        >

                          {t.type}

                          {t.type === "loan" && t.subType ? (
                            <div style={{ marginTop: 4 }}>
                              {t.subType === "asset" ? "Given" : "Taken"}
                            </div>
                          ) : null}

                          {t.againstId ? (
                            <div style={{ marginTop: 4 }}>
                              Against: {t.againstId.type || "entry"}
                              {t.againstId.amount
                                ? ` • ₹${Number(t.againstId.amount).toFixed(2)}`
                                : ""}
                            </div>
                          ) : null}

                        </div>

                      </td>

                      {/* DR */}

                      <td
                        style={
                          styles.td
                        }
                      >

                        {t.drcr ===
                        "DR"

                          ? `₹ ${Number(
                              t.amount
                            ).toFixed(
                              2
                            )}`

                          : "-"}

                      </td>

                      {/* CR */}

                      <td
                        style={
                          styles.td
                        }
                      >

                        {t.drcr ===
                        "CR"

                          ? `₹ ${Number(
                              t.amount
                            ).toFixed(
                              2
                            )}`

                          : "-"}

                      </td>

                      {/* BALANCE */}

                      <td
                        style={
                          styles.td
                        }
                      >

                        ₹

                        {" "}

                        {Number(
                          t.runningBalance
                        ).toFixed(
                          2
                        )}

                        {" "}

                        {t.balanceType}

                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="btn secondary"
                            onClick={() => navigate(`/edit/${t._id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn danger"
                            onClick={() => deleteEntry(t._id)}
                            disabled={deleting === t._id}
                          >
                            {deleting === t._id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

}

// ======================
// CARD
// ======================

function Card({
  title,
  value,
  color,
  extra,
}) {

  return (

    <div
      className="card"

      style={{
        textAlign:
          "center",

        padding: 20,
      }}
    >

      <p
        style={{
          opacity: 0.7,

          marginBottom:
            10,
        }}
      >
        {title}
      </p>

      <h2
        style={{ color }}
      >

        ₹

        {" "}

        {Number(
          value || 0
        ).toFixed(2)}

        {" "}

        {extra}

      </h2>

    </div>

  );

}

// ======================
// STYLES
// ======================

const styles = {

  th: {

    borderBottom:
      "1px solid #ddd",

    padding: 12,

    textAlign:
      "left",

    background:
      "#f8fafc",
  },

  td: {

    borderBottom:
      "1px solid #eee",

    padding: 12,
  },

};
