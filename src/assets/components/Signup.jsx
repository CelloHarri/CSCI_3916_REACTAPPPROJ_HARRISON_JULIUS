import { useState } from 'react';
import { signup } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import '../app.css';

export default function Signup() {
    const [form, setForm] = useState({ username: '', password: '', passwordConfirm: '' }); //State object holds all three form fields
    const [error, setError] = useState(''); //Error Messages
    const nav = useNavigate(); //Redirects to different page with nav('<path>')

    const handleSubmit = async (e) => {
        e.preventDefault(); //Don't reload the prowser on form submit
        try {
            await signup(form.username, form.password, form.passwordConfirm); //Calls signup api
            nav('/login'); //go to login page
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed'); //Show Error Message
        }
    };

    return (
        <div className="page">
            <div className="card">
                <h2>Sign Up</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input placeholder="Username" value={form.username}
                            onChange={e => setForm({ ...form, username: e.target.value })} required />
                        <input placeholder="Password" type="password" value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} required />
                        <input placeholder="Confirm Password" type="password" value={form.passwordConfirm}
                            onChange={e => setForm({ ...form, passwordConfirm: e.target.value })} required />
                    </div>
                    <button className="btn btn-primary" type="submit">Sign Up</button>
                </form>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
}