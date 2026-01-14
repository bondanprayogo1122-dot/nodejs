import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './views/Home';
import Admin from './views/Admin';
import InvoiceModal from './components/InvoiceModal';

// --- KOMPONEN LAYOUT (Berada di dalam Router) ---
// Kita taruh logika cek URL di sini agar tidak error blank screen
function Layout() {
  const location = useLocation(); // Mengambil URL saat ini

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      
      {/* FOOTER HANYA MUNCUL JIKA BUKAN HALAMAN ADMIN */}
      {location.pathname !== '/admin' && <Footer />}

      <InvoiceModal />
    </div>
  );
}

// --- COMPONENT UTAMA (Berada di luar / membungkus Router) ---
function App() {
  return (
    <ShopProvider>
      <Router>
        {/* Kita render Layout di dalam Router agar useLocation bekerja */}
        <Layout />
      </Router>
    </ShopProvider>
  );
}

export default App;