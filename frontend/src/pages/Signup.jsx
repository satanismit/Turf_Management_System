import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_API } from "../config";
import Card from "../components/Card";
import { Form, FormInput, FormButton } from "../components/Form";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confPassword: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // optional field allowed
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // trim common fields
    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      username: formData.username.trim(),
      password: formData.password.trim(),
      confPassword: formData.confPassword.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
    };

    // Validation
    if (payload.password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }
    if (payload.password !== payload.confPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    if (!validatePhone(payload.phone)) {
      setMessage("Phone number must be exactly 10 digits (numbers only).");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_API}/auth/signup`, {
        fullName: payload.fullName,
        email: payload.email,
        username: payload.username,
        password: payload.password,
        confPassword: payload.confPassword,
        phone: payload.phone,
        address: payload.address,
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
      });
      setMessage(res.data?.message || "Signup successful");
      navigate("/login");
    } catch (err) {
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Signup failed";
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-600">Join TurfManager today</p>
          </div>

          <Form onSubmit={handleSubmit}>
            <FormInput
              label="Full Name"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Phone Number (Optional)"
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <FormInput
              label="Address (Optional)"
              type="text"
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleInputChange}
            />
            <FormInput
              label="Date of Birth (Optional)"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender (Optional)
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <FormInput
              label="Password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Confirm Password"
              type="password"
              name="confPassword"
              placeholder="Confirm your password"
              value={formData.confPassword}
              onChange={handleInputChange}
              required
            />
            <FormButton type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </FormButton>
          </Form>

          {message && <p className="mt-4 text-center text-red-500">{message}</p>}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
