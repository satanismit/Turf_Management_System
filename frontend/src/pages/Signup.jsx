<<<<<<< HEAD
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_API } from '../config';
import Card from '../components/Card';
import { Form, FormInput, FormButton } from '../components/Form';


const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confPassword: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
=======
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
  });
  const [message, setMessage] = useState("");
>>>>>>> 1614f2e473ffb885157ebff77640cf4d3c1891b9
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
<<<<<<< HEAD

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confPassword) {
      setMessage('Passwords do not match!');
      return;
    }
    if (formData.phone && formData.phone.length !== 10) {
      setMessage('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_API}/auth/signup`, formData);
      setMessage(res.data.message);
      navigate('/login');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Signup failed');
=======
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }
    if (formData.password !== formData.confPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    if (formData.phone && formData.phone.length !== 10) {
      setMessage("Phone number must be exactly 10 digits.");
      return;
    }
    try {
      const res = await axios.post(`${BACKEND_API}/auth/signup`, formData);
      setMessage(res.data.message);
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.error || "Signup failed");
>>>>>>> 1614f2e473ffb885157ebff77640cf4d3c1891b9
    }
  };
  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center py-12
px-4 sm:px-6 lg:px-8"
    >
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
<<<<<<< HEAD

=======
>>>>>>> 1614f2e473ffb885157ebff77640cf4d3c1891b9
            <FormInput
              label="Phone Number (Optional)"
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
            />
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
            <FormButton type="submit">Create Account</FormButton>
          </Form>
<<<<<<< HEAD

          {message && <p className="mt-4 text-center text-red-500">{message}</p>}

=======
          {message && (
            <p className="mt-4 text-center text-red-500">{message}</p>
          )}
>>>>>>> 1614f2e473ffb885157ebff77640cf4d3c1891b9
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700
font-medium"
              >
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
