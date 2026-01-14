import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { FaShoppingCart } from 'react-icons/fa';
import CartModal from './CartModal';

const Footer = () => {
  const { cart } = useShop();
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <footer>
        {/* Hanya tombol keranjang */}
        <button className="footer-btn cart-btn" onClick={() => setShowCart(true)}>
          <FaShoppingCart /> Keranjang <span style={{background:'#ef4444', borderRadius:'50%', padding:'2px 6px', fontSize:'11px'}}>{cart.length}</span>
        </button>
      </footer>
      
      {/* Render CartModal di sini */}
      {showCart && <CartModal onClose={() => setShowCart(false)} />}
    </>
  );
};

export default Footer;