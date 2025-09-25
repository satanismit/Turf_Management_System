import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_API } from '../config';
import Card from '../components/Card';
import { Form, FormInput, FormButton } from '../components/Form';
const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_API}/auth/login`, formData);
      
      // Store both token and user data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Trigger auth state change
      window.dispatchEvent(new Event('authChange'));
      
      // Navigate based on user role
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    }
  };
  return (
    <div className="centered-page">
      <div className="form-container">
        <Card>
          <div className="text-center space-bottom-large">
            <h2 className="form-title">Sign In</h2>
            <p className="subtitle">
              Access your TurfManager account
            </p>
          </div>
          <Form onSubmit={handleSubmit}>
            {message && (
              <div className="space-bottom p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {message}
              </div>
            )}
            <FormInput
              label="Email or Username"
              type="text"
              placeholder="Enter your email or username"
              value={formData.identifier}
              onChange={(e) => handleInputChange({ target: { name: 'identifier', value: e.target.value } })}
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

          <div className="text-center space-top">
            <Link to="/forgot-password" className="btn-link">
              Forgot Password?
            </Link>
          </div>

          <div className="space-top-large text-center">
            <p className="text-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="btn-link">
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