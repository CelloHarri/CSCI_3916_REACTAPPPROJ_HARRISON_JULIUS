import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL

const authHeaders = () => ({
    headers: { Authorization: localStorage.getItem('token') }
});

// AUTH
export const signup = (username, password, passwordConfirm) =>
    axios.post(`${BASE}/api/public/pantry/signup`, { username, password, passwordConfirm });

export const signin = (username, password) =>
    axios.post(`${BASE}/api/public/pantry/signin`, { username, password });

// PANTRY (all require JWT)
export const getPantryItem = (id) => //Not Useful in Website
    axios.get(`${BASE}/api/private/pantry/${id}`, authHeaders());

export const getPantryItems = () =>
    axios.get(`${BASE}/api/private/pantry`, authHeaders());

export const createPantryItem = (data) =>
    axios.post(`${BASE}/api/private/pantry`, data, authHeaders());

export const updatePantryItem = (id, data) =>
    axios.put(`${BASE}/api/private/pantry/${id}`, data, authHeaders());

export const deletePantryItem = (id) =>
    axios.delete(`${BASE}/api/private/pantry/${id}`, authHeaders());