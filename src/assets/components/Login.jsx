import { useState } from 'react';
import { signin } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import '../app.css';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await signin(form.username, form.password);
            localStorage.setItem('token', res.data.token)
            nav('/pantry');
        }
        catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="page">
            <div className="card">
                <h2>Login</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input placeholder="Username" value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })} required />
                        <input placeholder="Password" type="password" value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button className="btn btn-primary" type="submit">Login</button>
                </form>
                <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
            </div>
        </div>
    )
}