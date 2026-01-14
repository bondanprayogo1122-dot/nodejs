import { useState } from 'react';
import { useShop } from '../context/ShopContext';

const AuthModal = ({ onClose }) => {
  const { register, login } = useShop();
  const [mode, setMode] = useState('login'); // login | register
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'register') {
      register(formData.name, formData.email, formData.password).then(success => success && onClose());
    } else {
      login(formData.email, formData.password).then(success => success && onClose());
    }
  };

  return (
    <div className="modal show" onClick={onClose}>
      <div className="box" onClick={e => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h3 style={{textAlign:'center', marginTop:0}}>{mode === 'login' ? 'Login' : 'Register'}</h3>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input type="text" placeholder="Nama Lengkap" required 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          )}
          <input type="email" placeholder="Email" required 
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required 
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <button type="submit" className="submit-btn">{mode}</button>
          
          <p style={{textAlign:'center', cursor:'pointer', color:'#3b82f6', marginTop:12, fontSize:'14px'}}
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Belum punya akun? Register' : 'Sudah punya akun? Login'}
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;