import React, { useState, useRef, useEffect } from 'react';
import { productsApi, inventoryApi } from '../api/client';
import ProductRow from '../components/ProductRow';
import SaleTicket from '../components/SaleTicket';

function SalesPage() {
  const [barcode, setBarcode] = useState('');
  const [lines, setLines] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completedSale, setCompletedSale] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus barcode input on mount and after each sale
    inputRef.current?.focus();
  }, [completedSale]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barcode) return;

    try {
      setError('');
      const { data: product } = await productsApi.getByBarcode(barcode);
      
      // Check if product already in cart
      const existingLine = lines.find(l => l.product.barcode === product.barcode);
      if (existingLine) {
        setLines(lines.map(line => 
          line.product.barcode === product.barcode
            ? { ...line, qty: line.qty + 1 }
            : line
        ));
      } else {
        setLines([...lines, { product, qty: 1 }]);
      }
      
      setBarcode('');
    } catch (err) {
      setError('Producto no encontrado');
      setBarcode('');
    }
  };

  const handleQuantityChange = (line, newQty) => {
    if (newQty < 1) return;
    setLines(lines.map(l => 
      l.product.barcode === line.product.barcode
        ? { ...l, qty: newQty }
        : l
    ));
  };

  const handleDelete = (line) => {
    setLines(lines.filter(l => l.product.barcode !== line.product.barcode));
  };

  const handleCompleteSale = async () => {
    if (!lines.length) return;

    try {
      const { data } = await inventoryApi.sale({
        lines: lines.map(line => ({
          barcode: line.product.barcode,
          qty: line.qty
        }))
      });

      setCompletedSale(data);
      setSuccess('Venta realizada con éxito');
      setLines([]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la venta');
    }
  };

  const total = lines.reduce((sum, line) => 
    sum + (line.product.sale_price * line.qty), 0
  );

  return (
    <div className="card">
      <h1>Nueva Venta</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit} className="form-group">
        <label htmlFor="barcode">Código de barras</label>
        <input
          ref={inputRef}
          id="barcode"
          type="text"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          autoFocus
        />
      </form>

      {lines.length > 0 && (
        <>
          <table style={{ marginTop: '2rem' }}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <ProductRow
                  key={i}
                  product={{ ...line.product, qty: line.qty }}
                  onQuantityChange={handleQuantityChange}
                  onDelete={handleDelete}
                />
              ))}
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  TOTAL:
                </td>
                <td colSpan="2" style={{ fontWeight: 'bold' }}>
                  {total.toFixed(2)} €
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={handleCompleteSale}
            >
              Finalizar Venta
            </button>
          </div>
        </>
      )}

      {completedSale && <SaleTicket {...completedSale} />}
    </div>
  );
}

export default SalesPage;
