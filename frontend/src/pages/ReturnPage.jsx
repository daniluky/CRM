import React, { useState, useRef, useEffect } from 'react';
import { productsApi, inventoryApi } from '../api/client';

// ReturnPage gestiona devoluciones escaneando el producto
function ReturnPage() {
  const [barcode, setBarcode] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [product, setProduct] = useState(null);
  const inputRef = useRef(null);

  // Autoenfoque del campo de código al montar la vista
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // handleSubmit busca el producto asociado al código ingresado
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barcode) return;

    try {
      setError('');
      const { data } = await productsApi.getByBarcode(barcode);
      setProduct(data);
      setBarcode('');
    } catch (err) {
      setError('Producto no encontrado');
      setBarcode('');
      setProduct(null);
    }
  };

  // handleReturn envía la devolución al backend y limpia el formulario
  const handleReturn = async () => {
    if (!product || qty < 1) return;

    try {
      await inventoryApi.return({
        barcode: product.barcode,
        qty,
        note: 'Devolución'
      });

      setSuccess('Devolución procesada con éxito');
      setProduct(null);
      setQty(1);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la devolución');
    }
  };

  return (
    <div className="card">
      <h1>Devolución</h1>

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

      {product && (
        <div style={{ marginTop: '2rem' }}>
          <div className="form-group">
            <label>Producto</label>
            <p>{product.name}</p>
          </div>

          <div className="form-group">
            <label htmlFor="qty">Cantidad a devolver</label>
            <input
              id="qty"
              type="number"
              min="1"
              value={qty}
              onChange={e => setQty(parseInt(e.target.value, 10))}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleReturn}
          >
            Procesar Devolución
          </button>
        </div>
      )}
    </div>
  );
}

export default ReturnPage;
