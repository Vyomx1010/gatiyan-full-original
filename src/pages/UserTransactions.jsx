import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Usersnavbar"; // Adjust the path if needed

const UserTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Ensure the correct token key is used (adjust if your login stores it under a different key)
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User token not found");
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/transactions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Transactions fetched:", res.data);
        setTransactions(Array.isArray(res.data.payments) ? res.data.payments : []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.response?.data?.message || err.message);
        setTransactions([]);
      }
    };
    fetchTransactions();
  }, []);

  if (error) {
    return (
      <>
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Your Transactions</h1>
          <div className="bg-red-100 text-red-800 p-4 rounded shadow">
            Error: {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Transactions</h1>
        {transactions.length === 0 ? (
          <div className="bg-white shadow-lg rounded p-6 text-center">
            <p className="text-gray-500 text-lg">No transactions available</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Method
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((payment) => (
                  <tr key={payment._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">₹{payment.amount}</td>
                    <td className="px-6 py-4 text-center">{payment.paymentMethod}</td>
                    <td
                      className={`px-6 py-4 text-center ${
                        payment.paymentStatus === "done"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }`}
                    >
                      {payment.paymentStatus}
                    </td>
                    <td className="px-6 py-4">
                      {payment.transactionId || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {payment.ride?.user?.mobileNumber ||
                        (payment.ride === null &&
                          payment.userDetails &&
                          payment.userDetails.mobileNumber) ||
                        "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {payment.ride?.user?.email ||
                        (payment.ride === null &&
                          payment.userDetails &&
                          payment.userDetails.email) ||
                        "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default UserTransactions;
