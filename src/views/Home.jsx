import { useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { FaThLarge, FaShoppingBag } from 'react-icons/fa';

const Home = () => {
  const { allItems, loadItems, addToCart } = useShop();

  useEffect(() => {
    loadItems();
  }, []);

  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>Solusi Bangunan Terlengkap</h1>
          <p>Dapatkan bahan bangunan berkualitas dengan harga terbaik.</p>
          <button className="cta-button" onClick={() => document.getElementById('products').scrollIntoView({behavior:'smooth'})}>
            <FaShoppingBag /> Belanja Sekarang
          </button>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="container">
        <h2 className="section-title"><FaThLarge /> Katalog Produk</h2>
        
        <div className="grid">
          {allItems.map(item => (
            <div className="card" key={item.id}>
              <img src={item.image_url || 'https://via.placeholder.com/150'} alt={item.name} />
              <div style={{display:'flex', flexDirection:'column', height:'100%', justifyContent:'space-between'}}>
                <div>
                  <h3>{item.name}</h3>
                  <div className="price">{formatIDR(item.pricing)}</div>
                </div>
                <button onClick={() => addToCart(item.id, 1)}>
                  <i className="fas fa-cart-plus"></i> Tambah +
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;