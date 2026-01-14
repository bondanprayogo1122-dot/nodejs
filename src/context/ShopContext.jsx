import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API = "http://localhost:3000";

const ShopContext = createContext();

// Fungsi bantuan untuk mendecode JWT (membaca data di dalam token)
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const ShopProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || null);
  
  // 1. TAMBAHKAN STATE ROLE DI SINI
  const [role, setRole] = useState(localStorage.getItem('role') || null);

  const [cart, setCart] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Load Items
  const loadItems = async () => {
    try {
      const res = await axios.get(`${API}/api/items`);
      setAllItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  // --- AUTH LOGIC ---
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      
      if (res.data.token) {
        const newToken = res.data.token;
        setToken(newToken);
        localStorage.setItem('token', newToken);

        // --- LOGIKA MENGAMBIL ROLE ---
        // Coba ambil role dari res.data.user (sesuai contoh JSON Anda sebelumnya)
        // Jika tidak ada, decode dari token JWT-nya
        let userRole = 'user'; // Default user
        let displayName = email.split('@')[0];

        if (res.data.user && res.data.user.role) {
          userRole = res.data.user.role;
          displayName = res.data.user.name || displayName;
        } else {
          // Decode JWT jika backend hanya kirim token
          const decoded = parseJwt(newToken);
          if (decoded && decoded.role) {
            userRole = decoded.role;
          }
        }

        setRole(userRole);
        localStorage.setItem('role', userRole); // Simpan role ke localStorage
        // ------------------------------

        setUserName(displayName);
        localStorage.setItem('userName', displayName);

        Swal.fire({ icon: 'success', title: 'Login Berhasil', timer: 1500, showConfirmButton: false });
        return true;
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Email/Password salah' });
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post(`${API}/api/auth/register`, { name, email, password });
      setUserName(name);
      localStorage.setItem('userName', name);
      await login(email, password);
      return true;
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Register gagal' });
      return false;
    }
  };

  const logout = () => {
    Swal.fire({
      title: 'Keluar Akun?', text: "Anda akan logout.", icon: 'question',
      showCancelButton: true, confirmButtonText: 'Ya, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        // 2. HAPUS ROLE SAAT LOGOUT
        setToken(null); 
        setUserName(null); 
        setRole(null); 
        setCart([]);
        
        localStorage.removeItem('token'); 
        localStorage.removeItem('userName');
        localStorage.removeItem('role'); // Hapus role dari storage
        
        window.location.href = '/';
      }
    });
  };

  // --- CART LOGIC ---
  const addToCart = (itemId, qty) => {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    const existing = cart.find(c => c.item_id === itemId);
    let newCart = [];
    if (existing) newCart = cart.map(c => c.item_id === itemId ? { ...c, qty: c.qty + qty } : c);
    else newCart = [...cart, { item_id: itemId, name: item.name, price: item.pricing, qty }];
    setCart(newCart);
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 }).fire({ icon: 'success', title: 'Masuk Keranjang' });
  };
  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
  const clearCart = () => setCart([]);

  const createOrder = async () => {
    if (cart.length === 0) return;
    if (!token) { Swal.fire('Info', 'Silakan login dulu', 'info'); return; }
    try {
      const payload = cart.map(c => ({ item_id: c.item_id, qty: c.qty }));
      const res = await axios.post(`${API}/api/order`, { items: payload }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.order_id) {
        clearCart();
        return res.data.order_id;
      }
    } catch (err) { Swal.fire('Error', 'Gagal membuat order', 'error'); }
  };

  // --- ADMIN LOGIC ---
  const loadOrders = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/order`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) { console.error(err); }
  };

  const addProduct = async (product) => {
    try {
      await axios.post(`${API}/api/items`, product, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Sukses', 'Produk ditambahkan', 'success');
      loadItems();
    } catch (err) { Swal.fire('Gagal', 'Gagal tambah produk', 'error'); }
  };

  const updateProduct = async (id, product) => {
    try {
      await axios.put(`${API}/api/items/${id}`, product, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Sukses', 'Produk berhasil diupdate', 'success');
      loadItems();
      return true;
    } catch (err) {
      Swal.fire('Gagal', 'Gagal update produk', 'error');
      return false;
    }
  };

  return (
    // 3. EKSPOR ROLE KE VALUE PROVIDER
    <ShopContext.Provider value={{
      token, userName, role, cart, allItems, orders, currentPage, setCurrentPage,
      loadItems, login, register, logout, addToCart, removeFromCart, clearCart, createOrder,
      loadOrders, addProduct, updateProduct
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);