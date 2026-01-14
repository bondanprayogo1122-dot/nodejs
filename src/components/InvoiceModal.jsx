import { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { useShop } from '../context/ShopContext';

const InvoiceModal = () => {
  const { token } = useShop();
  const [invoiceData, setInvoiceData] = useState(null);
  const [show, setShow] = useState(false);
  const ref = useRef(); // Ref untuk elemen HTML (PDF)
  
  // TAMBAHKAN REF INI UNTUK MENYIMPAN TOKEN TERBARU
  const tokenRef = useRef(token); 

  // Update ref setiap kali token berubah
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    const handler = (e) => {
      const orderId = e.detail;
      // Gunakan tokenRef.current INI, bukan 'token' langsung
      fetchInvoice(orderId, tokenRef.current);
    };
    window.addEventListener('openInvoice', handler);
    return () => window.removeEventListener('openInvoice', handler);
  }, []); // Bisa tetap kosong, karena kita membaca token via ref

  // Ubah fetchInvoice agar menerima parameter token
  const fetchInvoice = async (id, currentToken) => {
    // Cek token yang lewat via parameter (ref)
    if (!currentToken) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/invoice/${id}`, {
        // PAKAI currentToken
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      const data = await res.json();
      
      // Logika pemrosesan item tetap sama
      const items = data.items || data.OrderItems || [];
      const processedItems = items.map(i => ({
        name: i.name || i.Item?.name,
        qty: i.qty,
        price: i.price || i.Item?.pricing || 0
      }));

      setInvoiceData({ ...data, items: processedItems });
      setShow(true);
    } catch (err) {
      console.error(err);
      alert('Gagal load invoice');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePDF = () => {
    const opt = { margin: 10, filename: 'Invoice.pdf', html2canvas: { scale: 2 } };
    html2pdf().set(opt).from(ref.current).save();
  };

  if (!show || !invoiceData) return null;

  const total = invoiceData.items.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(n);

  return (
    <div className="modal show" onClick={() => setShow(false)}>
      <div className="invoice-box" style={{background:'#fff', margin:'20px'}} ref={ref} onClick={e => e.stopPropagation()}>
        {/* ... Tampilan Invoice tetap sama ... */}
        <div className="invoice-header">
          <h2>🧱 TOKO BANGUNAN</h2>
          <p>Jalan Konstruksi No. 123, Jakarta</p>
          <hr style={{borderTop:'1px dashed #000', margin:'10px 0'}} />
          <p style={{textAlign:'left'}}><strong>Order ID:</strong> #{invoiceData.id}</p>
        </div>
        <table className="invoice-table">
          <thead><tr><th>Item</th><th style={{textAlign:'center'}}>Qty</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
          <tbody>
            {invoiceData.items.map((i, idx) => (
              <tr key={idx}>
                <td>{i.name}</td>
                <td style={{textAlign:'center'}}>{i.qty}</td>
                <td style={{textAlign:'right'}}>{formatIDR(i.price * i.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="invoice-total">TOTAL: {formatIDR(total)}</div>
        
        <div style={{marginTop:'20px', textAlign:'center', borderTop:'1px solid #000', paddingTop:'15px'}}>
          <button onClick={handlePrint} style={{marginRight:'10px', padding:'8px 16px', background:'#000', color:'#fff', border:'none', borderRadius:'4px'}}>Print</button>
          <button onClick={handlePDF} style={{padding:'8px 16px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'4px'}}>PDF</button>
          <button onClick={() => setShow(false)} style={{marginLeft:'10px', padding:'8px 16px', background:'#94a3b8', color:'#fff', border:'none', borderRadius:'4px'}}>Tutup</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;