import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPantryItems, createPantryItem, updatePantryItem, deletePantryItem } from '../api';
import '../app.css';

const BLANK = { name: '', category: '', amount: 1, quantity: '', expirationDate: '', imageUrl: '', amountAlert: '', criticalAlert: false };
//Empty Template for after a cancel or addPantryItem Occurs

export default function Pantry() {
    const [items, setItems] = useState([]); //Array of Pantry Items
    const [form, setForm] = useState(BLANK); //Add/Edit Form
    const [editId, setEditId] = useState(null); //null is add mode, and item id is edit mode
    const [error, setError] = useState('');
    const [search, setSearch] = useState(''); //Search filter string
    const nav = useNavigate();

    const loadItems = async () => {
        try {
            const res = await getPantryItems();
            setItems(res.data.pantryItems);
        } catch (err) {
            nav('/login') //Token Expired
        }
    };

    useEffect(() => { loadItems(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) {
                await updatePantryItem(editId, form);
            }
            else {
                await createPantryItem(form);
            }
            setForm(BLANK);
            setEditId(null);
            loadItems(); //Refresh Pantry List
        } catch (err) {
            setError(err.response?.data?.message || 'Pantry Creation Failed')
        }
    };

    const startEdit = (item) => {
        setEditId(item._id);                       // Switches form to "Edit" mode for this item
        setForm({                                  // Pre-fills the form with the item's current values
            name: item.name,
            category: item.category,
            amount: item.amount,
            amountAlert: item.amountAlert ?? null,
            criticalAlert: item.criticalAlert ?? false,
            quantity: item.quantity || '',
            expirationDate: item.expirationDate?.slice(0, 10) || '', // ISO date → YYYY-MM-DD for <input type="date">
            imageUrl: item.imageUrl || ''
        });
    };

    const handleDelete = async (id) => {
        await deletePantryItem(id);
        loadItems();
    };

    const handleAdjust = async (item, delta) => {
        const newAmount = Math.max(0, item.amount + delta);
        await updatePantryItem(item._id, { amount: newAmount });
        loadItems();
    };

    const logout = async () => {
        localStorage.removeItem('token');
        nav('/login');
    };

    // Items where criticalAlert is true AND amount is at or below amountAlert
    const criticalItems = items.filter(item =>
        item.criticalAlert && item.amountAlert != null && item.amount < item.amountAlert
    );

    // Filter items by search query (name or category)
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <div className="pantry-page">
            <div className="pantry-header">
                <h2>My Pantry</h2>
                <button className="btn btn-secondary" onClick={logout}>Logout</button>
                <title>My Pantry</title>
            </div>

            {criticalItems.map(item => (
                <div key={item._id} className="alert-banner">
                    &#9888; <strong>{item.name}</strong> is critically low! ({item.amount} {item.quantity} remaining)
                </div>
            ))}

            {error && <p className="error">{error}</p>}

            <input
                className="search-bar"
                placeholder="Search by name or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <div className="pantry-form">
                <h3>{editId ? 'Edit Item' : 'Add Item'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <input placeholder="Name*" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} required />
                        <input placeholder="Category*" value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })} required />
                        <input placeholder="Amount" type="number" value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })} />
                        <select value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}>
                            <option value="">-- Unit --</option>
                            {['lbs', 'grams', 'oz', 'count', 'kilograms'].map(u => <option key={u}>{u}</option>)}
                        </select>
                        <input placeholder="Expiration Date" type="date" value={form.expirationDate}
                            onChange={e => setForm({ ...form, expirationDate: e.target.value })} />
                        <input placeholder="Image URL" value={form.imageUrl}
                            onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                        <input placeholder="Low Stock Alert (amount)" type="number" value={form.amountAlert ?? ''}
                            onChange={e => setForm({ ...form, amountAlert: e.target.value === '' ? null : Number(e.target.value) })} />
                        <label className="checkbox-label">
                            <input type="checkbox" checked={!!form.criticalAlert}
                                onChange={e => setForm({ ...form, criticalAlert: e.target.checked })} />
                            Critical Alert (banner at top)
                        </label>
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-primary" type="submit">{editId ? 'Save' : 'Add Item'}</button>
                        {editId && <button className="btn btn-secondary" type="button" onClick={() => { setEditId(null); setForm(BLANK); }}>Cancel</button>}
                    </div>
                </form>
            </div>

            <ul className="pantry-list">
                {filteredItems.map(item => (
                    <li key={item._id} className="pantry-item">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="pantry-item-img" />}
                        <div className="pantry-item-info">
                            <strong>{item.name}</strong>
                            {item.amountAlert != null && item.amount < item.amountAlert && (
                                <span className="badge-low">&#9888; Low</span>
                            )}
                            <span>{item.category}</span>
                            <span>Qty: {item.amount} {item.quantity}</span>
                            {item.expirationDate && <span>Exp: {new Date(item.expirationDate).toLocaleDateString()}</span>}
                        </div>
                        <div className="pantry-item-actions">
                            <div className="adjust-btns">
                                <button className="btn btn-secondary btn-sm" onClick={() => handleAdjust(item, -1)}>−</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => handleAdjust(item, 1)}>+</button>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(item)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}