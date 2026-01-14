import { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  FaBoxOpen, FaPlus, FaArrowLeft, FaList, 
  FaEdit, FaChartBar, FaHome, FaStore, FaShoppingCart 
} from 'react-icons/fa';

const Admin = () => {
  const navigate = useNavigate();
  const { role, loadOrders, orders, addProduct, updateProduct, loadItems, allItems } = useShop();
  
  // State UI
  const [activeTab, setActiveTab] = useState('home'); 
  
  // State Modals
  const [editProduct, setEditProduct] = useState(null); 
  const [editFormData, setEditFormData] = useState({});
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({ name: '', pricing: '', quantity: '', image_url: '' });

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // 1. INITIALIZATION & AUTH
  useEffect(() => {
    if (role !== 'admin') {
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'Halaman ini khusus Administrator.',
        confirmButtonText: 'Kembali ke Beranda',
        confirmButtonColor: '#1e293b'
      }).then(() => {
        navigate('/');
      });
    } else {
      loadOrders();
    }
  }, [role, navigate, loadOrders]); 

  // --- NAVIGATION HANDLERS ---
  const goToHome = () => {
    setActiveTab('home');
    loadOrders(); 
  };

  const goToOrders = () => {
    setActiveTab('orders');
    loadOrders();
  };

  const goToProducts = () => {
    setActiveTab('products');
    loadItems();
  };

  // --- HELPER TOAST (Sudah benar menggunakan Toast) ---
  const showToast = (icon, title) => {
    const Toast = Swal.mixin({
      toast: true, 
      position: 'top-end', 
      showConfirmButton: false, 
      timer: 3000, 
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    Toast.fire({ icon, title });
  };
  
  // --- LOGIC ---
  
  const getStats = () => {
    const currentOrders = Array.isArray(orders) ? orders : [];
    const days = [];
    const dataPoints = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      
      const dailyTotal = currentOrders
        .filter(o => o.createdAt && new Date(o.createdAt).toDateString() === d.toDateString())
        .reduce((acc, curr) => acc + (curr.total || 0), 0);
        
      days.push(dateStr);
      dataPoints.push(dailyTotal);
    }
    return { days, dataPoints };
  };

  const stats = getStats();
  const maxSale = Math.max(...stats.dataPoints, 1000); 

  // Handle Add Product (PERBAIKAN: Gunakan try/catch agar modal pasti tutup jika sukses)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // Panggil fungsi addProduct dari context
      await addProduct({
        name: newProduct.name,
        pricing: Number(newProduct.pricing),
        quantity: Number(newProduct.quantity),
        image_url: newProduct.image_url || 'https://via.placeholder.com/150'
      });
      
      // Jika sampai sini berarti tidak ada error (SUKSES)
      showToast('success', 'Produk berhasil ditambahkan');
      
      // Reset Form & Tutup Modal
      setNewProduct({ name: '', pricing: '', quantity: '', image_url: '' });
      setAddModalOpen(false); 
      loadItems(); // Refresh list produk
      
    } catch (error) {
      console.error(error);
      showToast('error', 'Gagal menambahkan produk');
    }
  };

  // Handle Edit Product (PERBAIKAN: Gunakan try/catch agar modal pasti tutup)
  const openEditModal = (item) => {
    setEditProduct(item);
    setEditFormData({
      name: item.name, pricing: item.pricing, quantity: item.quantity, image_url: item.image_url
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      // Panggil fungsi updateProduct dari context
      await updateProduct(editProduct.id, {
        name: editFormData.name, 
        pricing: Number(editFormData.pricing), 
        quantity: Number(editFormData.quantity), 
        image_url: editFormData.image_url
      });

      // Jika sampai sini berarti tidak ada error (SUKSES)
      showToast('success', 'Data produk diperbarui');
      
      // Tutup Modal
      setEditProduct(null);
      loadItems(); // Refresh list produk

    } catch (error) {
      console.error(error);
      showToast('error', 'Gagal memperbarui produk');
    }
  };

  const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(n);

  // --- STYLES ---
  const containerStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, sans-serif' };
  const sidebarStyle = { 
    width: '260px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column',
    position: 'fixed', height: '100vh', left: 0, top: 0
  };
  const contentStyle = { marginLeft: '260px', flex: 1, padding: '2rem' };
  const navItemStyle = (isActive) => ({
    padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: '0.2s',
    backgroundColor: isActive ? '#334155' : 'transparent', color: isActive ? '#60a5fa' : '#cbd5e1',
    borderLeft: isActive ? '4px solid #60a5fa' : '4px solid transparent', textDecoration: 'none'
  });
  const cardStyle = { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' };
  const buttonStyle = { padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' };

  return (
    <div style={containerStyle}>
      {/* --- SIDEBAR --- */}
      <aside style={sidebarStyle}>
        <div style={{ padding: '20px', borderBottom: '1px solid #334155', display:'flex', alignItems:'center', gap:'10px' }}>
          <FaStore size={24} color="#f59e0b" />
          <div>
            <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>TOKO ADMIN</div>
            <div style={{fontSize:'0.8rem', color:'#94a3b8'}}>Management Panel</div>
          </div>
        </div>
        
        <nav style={{ flex: 1, paddingTop: '20px' }}>
          <div style={navItemStyle(activeTab === 'home')} onClick={goToHome}>
            <FaHome /> Statistik
          </div>
          <div style={navItemStyle(activeTab === 'orders')} onClick={goToOrders}>
            <FaShoppingCart /> List Orders
          </div>
          <div style={navItemStyle(activeTab === 'products')} onClick={goToProducts}>
            <FaBoxOpen /> List Products
          </div>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
          <a href="/" style={{ textDecoration:'none', color:'#94a3b8', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}>
            <FaArrowLeft /> Kembali ke Toko
          </a>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={contentStyle}>
        <div style={{marginBottom:'30px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2 style={{color:'#0f172a', margin:0, fontWeight:'700'}}>
            {activeTab === 'home' && 'Dashboard Overview'}
            {activeTab === 'orders' && 'Daftar Pesanan Masuk'}
            {activeTab === 'products' && 'Inventaris Produk'}
          </h2>
          <span style={{color:'#64748b', fontSize:'0.9rem'}}>Halo, Administrator</span>
        </div>

        {/* --- 1. STATISTICS --- */}
        {activeTab === 'home' && (
          <>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginBottom:'30px'}}>
              <div style={{...cardStyle, borderLeft:'4px solid #3b82f6'}}>
                <div style={{color:'#64748b', fontSize:'0.9rem'}}>Total Pesanan</div>
                <div style={{fontSize:'2rem', fontWeight:'bold', color:'#1e293b'}}>{orders.length}</div>
              </div>
              <div style={{...cardStyle, borderLeft:'4px solid #10b981'}}>
                <div style={{color:'#64748b', fontSize:'0.9rem'}}>Total Produk</div>
                <div style={{fontSize:'2rem', fontWeight:'bold', color:'#1e293b'}}>{allItems.length}</div>
              </div>
              <div style={{...cardStyle, borderLeft:'4px solid #f59e0b'}}>
                <div style={{color:'#64748b', fontSize:'0.9rem'}}>Penjualan 7 Hari</div>
                <div style={{fontSize:'2rem', fontWeight:'bold', color:'#1e293b'}}>{formatIDR(stats.dataPoints.reduce((a,b)=>a+b,0))}</div>
              </div>
            </div>
            <div style={cardStyle}>
              <h3 style={{marginTop:0, marginBottom:'20px', color:'#334155'}}>Grafik Penjualan (7 Hari Terakhir)</h3>
              <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', height:'250px', gap:'10px'}}>
                {stats.days.map((day, idx) => {
                  const value = stats.dataPoints[idx];
                  const percent = (value / maxSale) * 100;
                  return (
                    <div key={idx} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', height:'100%'}}>
                      <div style={{position:'relative', flex:1, width:'100%', display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:'5px'}}>
                        <div style={{width:'40px', height: `${percent}%`, backgroundColor: '#3b82f6', borderRadius:'4px 4px 0 0', minHeight: value > 0 ? '4px' : '0', transition:'height 0.5s ease'}}></div>
                        {value > 0 && <span style={{position:'absolute', top:'-25px', fontSize:'0.75rem', fontWeight:'bold', color:'#334155'}}>{(value/1000000).toFixed(1)}jt</span>}
                      </div>
                      <span style={{fontSize:'0.8rem', color:'#64748b', marginTop:'8px', textAlign:'center'}}>{day}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* --- 2. ORDERS --- */}
        {activeTab === 'orders' && (
          <div style={cardStyle}>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.9rem'}}>
              <thead style={{background:'#f8fafc', textAlign:'left'}}>
                <tr>
                  <th style={{padding:'12px', borderBottom:'2px solid #e2e8f0'}}>ID</th>
                  <th style={{padding:'12px', borderBottom:'2px solid #e2e8f0'}}>Customer</th>
                  <th style={{padding:'12px', borderBottom:'2px solid #e2e8f0'}}>Items</th>
                  <th style={{padding:'12px', borderBottom:'2px solid #e2e8f0'}}>Tanggal</th>
                  <th style={{padding:'12px', borderBottom:'2px solid #e2e8f0', textAlign:'right'}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice((page-1)*rowsPerPage, page*rowsPerPage).map(o => {
                  const itemsList = o.OrderItems && Array.isArray(o.OrderItems) ? o.OrderItems.map(i => `${i.qty}x ${i.Item?.name || 'Item'}`).join(', ') : '-';
                  return (
                    <tr key={o.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                      <td style={{padding:'12px', color:'#64748b'}}>#{o.id}</td>
                      <td style={{padding:'12px', fontWeight:'500'}}>{o.User?.name || 'Guest'}</td>
                      <td style={{padding:'12px', color:'#475569', maxWidth:'250px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={itemsList}>{itemsList}</td>
                      <td style={{padding:'12px'}}>{new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
                      <td style={{padding:'12px', textAlign:'right', fontWeight:'bold', color:'#10b981'}}>{formatIDR(o.total)}</td>
                    </tr>
                  );
                })}
                {orders.length === 0 && <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color:'#94a3b8'}}>Belum ada pesanan.</td></tr>}
              </tbody>
            </table>
            {orders.length > rowsPerPage && (
              <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'10px', marginTop:'20px'}}>
                <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{...buttonStyle, background:page===1?'#e2e8f0':'#fff', border:'1px solid #cbd5e1'}}>Prev</button>
                <span style={{fontSize:'0.9rem', color:'#64748b'}}>Hal {page}</span>
                <button disabled={page>=Math.ceil(orders.length/rowsPerPage)} onClick={()=>setPage(p=>p+1)} style={{...buttonStyle, background:page>=Math.ceil(orders.length/rowsPerPage)?'#e2e8f0':'#fff', border:'1px solid #cbd5e1'}}>Next</button>
              </div>
            )}
          </div>
        )}

        {/* --- 3. PRODUCTS LIST --- */}
        {activeTab === 'products' && (
          <div style={cardStyle}>
            <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'20px'}}>
              <button onClick={() => setAddModalOpen(true)} style={{...buttonStyle, background:'#3b82f6', color:'white', display:'flex', alignItems:'center', gap:'8px'}}>
                <FaPlus /> Tambah Produk Baru
              </button>
            </div>

            <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.9rem'}}>
              <thead style={{background:'#f8fafc', textAlign:'left'}}>
                <tr>
                  <th style={{padding:'12px', borderBottom:'2px solid #e2e8f0'}}>Produk</th>
                  <th style={{padding:'12px', borderBottom:'2px solid #e2e8f0'}}>Harga</th>
                  <th style={{padding:'12px', borderBottom:'2px solid #e2e8f0'}}>Stok</th>
                  <th style={{padding:'12px', borderBottom:'2px solid #e2e8f0', textAlign:'right'}}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {allItems.map(p => (
                  <tr key={p.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={{padding:'12px', display:'flex', alignItems:'center', gap:'12px'}}>
                      <img src={p.image_url} alt="" style={{width:'40px', height:'40px', borderRadius:'6px', objectFit:'cover', background:'#f1f5f9'}} />
                      <span style={{fontWeight:'500'}}>{p.name}</span>
                    </td>
                    <td style={{padding:'12px'}}>{formatIDR(p.pricing)}</td>
                    <td style={{padding:'12px'}}>
                      <span style={{padding:'4px 8px', borderRadius:'12px', background:p.quantity < 10 ? '#fee2e2' : '#dcfce7', color:p.quantity < 10 ? '#ef4444' : '#166534', fontSize:'0.8rem', fontWeight:'600'}}>{p.quantity} Unit</span>
                    </td>
                    <td style={{padding:'12px', textAlign:'right'}}>
                      <button onClick={() => openEditModal(p)} style={{...buttonStyle, background:'#f59e0b', color:'white'}}>
                        <FaEdit /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* --- MODAL ADD PRODUCT --- */}
      {isAddModalOpen && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}} onClick={() => setAddModalOpen(false)}>
          <div style={{background:'white', width:'90%', maxWidth:'500px', borderRadius:'12px', padding:'24px'}} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h3 style={{margin:0}}>Tambah Produk Baru</h3>
              <span onClick={() => setAddModalOpen(false)} style={{cursor:'pointer', fontSize:'1.5rem', color:'#94a3b8'}}>&times;</span>
            </div>
            <form onSubmit={handleAddProduct}>
              <div style={{marginBottom:'10px'}}>
                <label>Nama</label>
                <input required style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name:e.target.value})} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px'}}>
                <div>
                  <label>Harga</label>
                  <input type="number" required style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} value={newProduct.pricing} onChange={e=>setNewProduct({...newProduct, pricing:e.target.value})} />
                </div>
                <div>
                  <label>Stok</label>
                  <input type="number" required style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} value={newProduct.quantity} onChange={e=>setNewProduct({...newProduct, quantity:e.target.value})} />
                </div>
              </div>
              <div style={{marginBottom:'15px'}}>
                <label>URL Gambar</label>
                <input style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} value={newProduct.image_url} onChange={e=>setNewProduct({...newProduct, image_url:e.target.value})} />
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <button type="submit" style={{flex:1, padding:'10px', background:'#10b981', color:'white', borderRadius:'6px', border:'none', cursor:'pointer'}}>Simpan</button>
                <button type="button" onClick={()=>setAddModalOpen(false)} style={{flex:1, padding:'10px', background:'#e2e8f0', color:'#333', borderRadius:'6px', border:'none', cursor:'pointer'}}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT PRODUCT --- */}
      {editProduct && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}} onClick={() => setEditProduct(null)}>
          <div style={{background:'white', width:'90%', maxWidth:'500px', borderRadius:'12px', padding:'24px'}} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h3 style={{margin:0}}>Edit Produk</h3>
              <span onClick={() => setEditProduct(null)} style={{cursor:'pointer', fontSize:'1.5rem', color:'#94a3b8'}}>&times;</span>
            </div>
            <form onSubmit={handleUpdateProduct}>
              <div style={{marginBottom:'10px'}}>
                <label>Nama</label>
                <input required style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} value={editFormData.name} onChange={e=>setEditFormData({...editFormData, name:e.target.value})} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px'}}>
                <div>
                  <label>Harga</label>
                  <input type="number" required style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} value={editFormData.pricing} onChange={e=>setEditFormData({...editFormData, pricing:e.target.value})} />
                </div>
                <div>
                  <label>Stok</label>
                  <input type="number" required style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} value={editFormData.quantity} onChange={e=>setEditFormData({...editFormData, quantity:e.target.value})} />
                </div>
              </div>
              <div style={{marginBottom:'15px'}}>
                <label>URL Gambar</label>
                <input style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}} value={editFormData.image_url} onChange={e=>setEditFormData({...editFormData, image_url:e.target.value})} />
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <button type="submit" style={{flex:1, padding:'10px', background:'#3b82f6', color:'white', borderRadius:'6px', border:'none', cursor:'pointer'}}>Update</button>
                <button type="button" onClick={()=>setEditProduct(null)} style={{flex:1, padding:'10px', background:'#e2e8f0', color:'#333', borderRadius:'6px', border:'none', cursor:'pointer'}}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;