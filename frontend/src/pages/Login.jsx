import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_API } from '../config';
import Card from '../components/Card';
import { Form, FormInput, FormButton } from '../components/Form';
const Login = () => {
  const [formData, setFormData] = useState({
<<<<<<< HEAD
    identifier: '',
    password: ''
  });
  const [message, setMessage] = useState('');
=======
    identifier: "",
    password: "",
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

=======
>>>>>>> 1614f2e473ffb885157ebff77640cf4d3c1891b9
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_API}/auth/login`, formData);
<<<<<<< HEAD
      localStorage.setItem('token', res.data.token);
      window.dispatchEvent(new Event('authChange'));
      navigate('/');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
=======
      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("authChange"));
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
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
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-gray-600">
              Access your TurfManager account
            </p>
          </div>
          <Form onSubmit={handleSubmit}>
            {message && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {message}
              </div>
            )}
            <FormInput
              label="Email or Username"
              type="text"
              placeholder="Enter your email or username"
              value={formData.identifier}
<<<<<<< HEAD
              onChange={(e) => handleInputChange({ target: { name: 'identifier', value: e.target.value } })}
=======
              onChange={(e) =>
                handleInputChange({
                  target: { name: "identifier", value: e.target.value },
                })
              }
>>>>>>> 1614f2e473ffb885157ebff77640cf4d3c1891b9
              required
            />
            <FormInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                handleInputChange({
                  target: { name: "password", value: e.target.value },
                })
              }
              required
            />
            <FormButton type="submit">Sign In</FormButton>
          </Form>
<<<<<<< HEAD

          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
              Forgot Password?
            </Link>
          </div>

=======
          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue500">
              Forgot Password?
            </Link>
          </div>
>>>>>>> 1614f2e473ffb885157ebff77640cf4d3c1891b9
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-600 hover:text-green-700
font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Login;