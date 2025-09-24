import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_API } from "../config";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_API}/auth/forgot-password`, {
        email,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error");
    }

  };
  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white
py-2 rounded"
          >
            Send Reset Email
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
        <div className="text-center mt-4">
          <Link to="/login" className="text-blue-600">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
