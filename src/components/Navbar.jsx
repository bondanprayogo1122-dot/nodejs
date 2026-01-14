import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'; // useNavigate tidak dipakai di sini, tapi saya biarkan jika nanti butuh
import { useShop } from '../context/ShopContext';
import { FaUser, FaSignOutAlt, FaUserShield, FaChevronDown } from 'react-icons/fa';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { token, userName, role, logout } = useShop();
  const [showMenu, setShowMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const menuRef = useRef(null);

  // 1. Klik luar menutup menu
  useEffect(() => {
    const handler = (e) => !menuRef.current?.contains(e.target) && setShowMenu(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 2. TAMBAHAN: Listener untuk membuka modal login (Dari CartModal)
  useEffect(() => {
    const handler = () => {
      setShowAuth(true);
    };

    // Pasang pendengar event global
    window.addEventListener('openAuthModal', handler);

    // Bersihkan event saat komponen di-unmount
    return () => {
      window.removeEventListener('openAuthModal', handler);
    };
  }, []);
  // ------------------------------------------------

  return (
    <header>
      <div className="header-content">
        <Link to="/" className="logo" style={{textDecoration:'none', color:'white'}}>
          <i className="fas fa-hard-hat"></i> TOKO BANGUNAN
        </Link>
        
        <div className="profile-container" ref={menuRef}>
          <button className="profile-btn" onClick={() => setShowMenu(!showMenu)}>
            <FaUser /> <span>{token ? `Halo, ${userName}` : 'Login'}</span> <FaChevronDown />
          </button>
          
          <div className={`dropdown-menu ${showMenu ? 'show' : ''}`}>
            {token ? (
              <>
                {/* Hanya render link ini jika role adalah 'admin' */}
                {role === 'admin' && (
                  <Link to="/admin" className="menu-item" style={{textDecoration:'none', color:'inherit'}}>
                    <FaUserShield /> Panel Admin
                  </Link>
                )}
                
                <div className="menu-item logout" onClick={logout}>
                  <FaSignOutAlt /> Logout
                </div>
              </>
            ) : (
              <div className="menu-item" onClick={() => { setShowAuth(true); setShowMenu(false); }}>
                <FaUser /> Login / Register
              </div>
            )}
          </div>
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </header>
  );
};

export default Navbar;