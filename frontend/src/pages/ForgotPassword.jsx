import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_API } from '../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${BACKEND_API}/auth/forgot-password`, { email });
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Error');
        }
    };

    return (
        <div className="centered-page">
            <div className="card-container form-container">
                <h2 className="form-title">Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-bottom">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-full">
                        Send Reset Email
                    </button>
                </form>
                {message && <p className="space-top text-center">{message}</p>}
                <div className="text-center space-top">
                    <Link to="/login" className="btn-link">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;