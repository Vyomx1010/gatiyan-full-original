import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScaleLoader from 'react-spinners/ScaleLoader';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Loader state added

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true); // Start loader
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/payments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Payments fetched:", res.data);
        // Ensure payments is an array before setting state
        setPayments(Array.isArray(res.data.payments) ? res.data.payments : []);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError(err.response?.data?.message || err.message);
        toast.error("Error fetching payments: " + (err.response?.data?.message || err.message)); // Proper popup
        setPayments([]); // Fallback to empty array
      } finally {
        setLoading(false); // Stop loader
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <ScaleLoader color="#4F46E5" height={35} width={5} />
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Payments</h1>
          <div className="bg-red-100 text-red-800 p-4 rounded shadow">
            Error: {error}
          </div>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Payments</h1>
        {payments.length === 0 ? (
          <div className="bg-white shadow-lg rounded p-6 text-center">
            <p className="text-gray-500 text-lg">No payments available</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Mobile
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
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {payment.ride?.user ? (
                        <>
                          {payment.ride.user.fullname.firstname}{" "}
                          {payment.ride.user.fullname.lastname}
                        </>
                      ) : payment.userDetails ? (
                        <>
                          {payment.userDetails.fullname.firstname}{" "}
                          {payment.userDetails.fullname.lastname}
                        </>
                      ) : (
                        "User not found"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payment.ride?.user?.mobileNumber ||
                        (payment.userDetails && payment.userDetails.mobileNumber) ||
                        "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">₹{payment.amount}</td>
                    <td className="px-6 py-4 text-center">
                      {payment.paymentMethod}
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default Payments;
