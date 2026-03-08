import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/api';

const roles = [
    { key: 'hod', label: 'HOD', icon: '👨‍💼' },
    { key: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
    { key: 'student', label: 'Student', icon: '🎓' },
];

export default function Login() {
    const [selectedRole, setSelectedRole] = useState('hod');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await login({ email, password, role: selectedRole });
            loginUser(data, data.token);
            navigate(`/${data.role}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (role) => {
        setSelectedRole(role);
        const emails = { hod: 'hod@college.com', faculty: 'faculty1@college.com', student: 'student1@college.com' };
        setEmail(emails[role]);
        setPassword('password123');
    };

    return (
        <div className="login-page">
            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="login-card">
                    <div className="login-header">
                        <motion.div
                            className="login-logo"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        >
                            🎓
                        </motion.div>
                        <h1>College Management</h1>
                        <p>Sign in to your account</p>
                    </div>

                    <div className="role-tabs">
                        {roles.map((role) => (
                            <button
                                key={role.key}
                                className={`role-tab ${selectedRole === role.key ? 'active' : ''}`}
                                onClick={() => { setSelectedRole(role.key); setError(''); }}
                            >
                                {role.icon} {role.label}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <motion.div
                            className="login-error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Signing in...' : `Sign in as ${roles.find(r => r.key === selectedRole)?.label}`}
                        </motion.button>
                    </form>

                    <div className="demo-creds">
                        <p>Demo Accounts <span>(click to fill)</span></p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                            {roles.map(r => (
                                <button
                                    key={r.key}
                                    onClick={() => fillDemo(r.key)}
                                    className="btn btn-outline btn-sm"
                                >
                                    {r.icon} {r.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
