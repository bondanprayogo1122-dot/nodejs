import { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { FaTrash, FaArrowLeft, FaCheckCircle, FaUniversity, FaWallet, FaQrcode, FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2'; 

const CartModal = ({ onClose }) => {
  const { cart, removeFromCart, createOrder, token } = useShop();
  
  const [step, setStep] = useState('cart'); 
  const [selectedMethod, setSelectedMethod] = useState(null);

  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const paymentMethods = [
    { id: 'bca', name: 'Transfer BCA', type: 'bank', detail: '123-456-7890 a.n TOKO BANGUNAN', icon: <FaUniversity /> },
    { id: 'mandiri', name: 'Transfer Mandiri', type: 'bank', detail: '890-123-4567 a.n TOKO BANGUNAN', icon: <FaUniversity /> },
    { id: 'gopay', name: 'GoPay', type: 'ewallet', detail: '0812-3456-7890 (A/N Admin)', icon: <FaWallet /> },
    { id: 'ovo', name: 'OVO', type: 'ewallet', detail: '0898-7654-3210 (A/N Admin)', icon: <FaWallet /> },
    { id: 'qris', name: 'QRIS', type: 'qris', detail: 'Scan QR di bawah ini', icon: <FaQrcode /> },
  ];

  // --- HANDLERS ---

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    
    // 1. CEK TOKEN / LOGIN
    if (!token) {
      // Feedback kecil berupa Toast
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500, // Cepat hilang
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });

      Toast.fire({
        icon: 'warning',
        title: 'Wajib Login',
        text: 'Membuka form login...'
      });

      // --- PERUBAHAN: Langsung tutup Modal Keranjang dan Buka Modal Login ---
      onClose();
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      // ------------------------------------------------------------------

      return;
    }

    // Jika sudah login, lanjut ke pilih metode
    setStep('methods');
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setStep('details');
  };

  const handleBackToCart = () => {
    setStep('cart');
  };

  const handleBackToMethods = () => {
    setStep('methods');
  };

  const handleConfirmPayment = () => {
    setStep('loading');
  };

  useEffect(() => {
    let timeoutId;
    if (step === 'loading') {
      timeoutId = setTimeout(async () => {
        const orderId = await createOrder();
        if (orderId) {
          const event = new CustomEvent('openInvoice', { detail: orderId });
          window.dispatchEvent(event);
          onClose();
        }
      }, 3000); 
    }
    return () => clearTimeout(timeoutId);
  }, [step]);

  return (
    <>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      
      <div className="modal show" onClick={onClose}>
        <div 
          className="box" 
          onClick={e => e.stopPropagation()} 
          style={{
            maxWidth: step === 'cart' ? '400px' : (step === 'methods' ? '500px' : '450px'),
            minHeight: step === 'loading' ? '300px' : 'auto'
          }}
        >
          <span className="close-btn" onClick={onClose}>&times;</span>
          
          {/* --- STEP 1: DAFTAR KERANJANG --- */}
          {step === 'cart' && (
            <>
              <h3 style={{marginTop:0}}>Keranjang Belanja</h3>
              <div style={{maxHeight: '300px', overflowY: 'auto', marginBottom:'20px'}}>
                {cart.length === 0 && <p style={{textAlign:'center', color:'#94a3b8', padding:'20px'}}>Keranjang Kosong</p>}
                {cart.map((item, idx) => (
                  <div key={idx} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f1f5f9'}}>
                    <div>
                      <strong style={{fontSize:'0.95rem'}}>{item.name}</strong><br/>
                      <small style={{color:'#64748b'}}>{item.qty} x {formatIDR(item.price)}</small>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontWeight:'bold'}}>{formatIDR(item.price * item.qty)}</div>
                      <button onClick={() => removeFromCart(idx)} style={{color:'#ef4444', border:'none', background:'transparent', cursor:'pointer', marginTop:'2px'}}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:'right', marginBottom:'16', fontWeight:'bold', borderTop:'2px solid #e2e8f0', paddingTop:12}}>
                Total: <span style={{fontSize:'1.2rem', color:'#0f172a'}}>{formatIDR(total)}</span>
              </div>
              {cart.length > 0 && (
                <button 
                  onClick={handleCheckoutClick} 
                  style={{width:'100%', padding:'12px', background:'#10b981', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', fontSize:'1rem', display:'flex', justifyContent:'center', alignItems:'center', gap:'8px'}}
                >
                  Lanjut ke Pembayaran <FaArrowLeft style={{transform:'rotate(180deg)'}} />
                </button>
              )}
            </>
          )}

          {/* --- STEP 2: PILIH METODE --- */}
          {step === 'methods' && (
            <>
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}>
                <button onClick={handleBackToCart} style={{background:'transparent', border:'none', color:'#64748b', cursor:'pointer', fontSize:'1.2rem'}}>
                  <FaArrowLeft />
                </button>
                <h3 style={{margin:0, fontSize:'1.1rem'}}>Metode Pembayaran</h3>
              </div>

              <div style={{background:'#f8fafc', padding:'15px', borderRadius:'8px', marginBottom:'20px'}}>
                <p style={{margin:0, fontSize:'0.9rem', color:'#64748b'}}>Total Tagihan:</p>
                <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#0f172a'}}>{formatIDR(total)}</div>
              </div>

              <div style={{display:'grid', gap:'10px', marginBottom:'20px'}}>
                {paymentMethods.map(method => (
                  <div 
                    key={method.id}
                    onClick={() => handleSelectMethod(method)}
                    style={{
                      display:'flex', 
                      alignItems:'center', 
                      gap:'15px',
                      padding:'15px',
                      border: '1px solid #e2e8f0',
                      borderRadius:'8px',
                      cursor:'pointer',
                      background:'white',
                      transition:'0.2s',
                    }}
                    className="payment-card"
                  >
                    <div style={{fontSize:'1.8rem', color: method.type === 'bank' ? '#f59e0b' : (method.type === 'qris' ? '#ec4899' : '#3b82f6')}}>
                      {method.icon}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:'bold'}}>{method.name}</div>
                    </div>
                    <FaArrowLeft style={{transform:'rotate(-180deg)', color:'#cbd5e1'}} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* --- STEP 3: DETAIL PEMBAYARAN / QRIS --- */}
          {step === 'details' && (
            <>
               <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}>
                <button onClick={handleBackToMethods} style={{background:'transparent', border:'none', color:'#64748b', cursor:'pointer', fontSize:'1.2rem'}}>
                  <FaArrowLeft />
                </button>
                <h3 style={{margin:0, fontSize:'1.1rem'}}>Detail Pembayaran</h3>
              </div>

              <div style={{textAlign:'center', marginBottom:'20px'}}>
                {selectedMethod?.id === 'qris' && (
                  <>
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TokoBangunanFakePayment" 
                      alt="QRIS" 
                      style={{width:'200px', height:'200px', border:'1px solid #ddd', padding:'10px', borderRadius:'8px'}}
                    />
                    <p style={{marginTop:'10px', color:'#64748b', fontSize:'0.9rem'}}>Scan menggunakan GoPay, OVO, atau Mobile Banking</p>
                  </>
                )}
                {paymentMethods.filter(m => m.id !== 'qris').map(m => selectedMethod?.id === m.id && (
                  <div key={m.id} style={{background:'#f8fafc', padding:'15px', borderRadius:'8px', textAlign:'left'}}>
                    <p style={{margin:0, fontSize:'0.9rem', color:'#64748b'}}>Nomor Rekening / Ponsel:</p>
                    <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#0f172a', letterSpacing:'1px', fontFamily:'monospace', margin:'10px 0'}}>
                      {m.detail.split(' ')[0]}
                    </div>
                    <p style={{margin:0, fontSize:'0.9rem', color:'#334155'}}>{m.detail}</p>
                  </div>
                ))}
                <div style={{marginTop:'20px', borderTop:'2px dashed #e2e8f0', paddingTop:'15px'}}>
                  <p style={{margin:0, color:'#64748b', fontSize:'0.9rem'}}>Total Pembayaran:</p>
                  <div style={{fontSize:'2rem', fontWeight:'bold', color:'#0f172a'}}>{formatIDR(total)}</div>
                </div>
              </div>

              <button 
                onClick={handleConfirmPayment}
                style={{width:'100%', padding:'12px', background:'#0f172a', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', fontSize:'1rem'}}
              >
                Saya Sudah Bayar
              </button>
            </>
          )}

          {/* --- STEP 4: LOADING --- */}
          {step === 'loading' && (
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'250px', textAlign:'center'}}>
              <FaSpinner size={50} style={{color:'#3b82f6', marginBottom:'20px', animation: 'spin 1s linear infinite'}} />
              <h3 style={{margin:0, color:'#0f172a'}}>Sedang Memeriksa Pembayaran...</h3>
              <p style={{color:'#64748b'}}>Mohon jangan tutup halaman ini.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default CartModal;