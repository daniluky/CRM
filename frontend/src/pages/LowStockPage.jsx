import React, { useState, useEffect } from 'react';
import { inventoryApi, API_BASE_URL } from '../api/client';
import ProductRow from '../components/ProductRow';

function LowStockPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadLowStock();
  }, []);

  const loadLowStock = async () => {
    try {
      const { data } = await inventoryApi.getLowStock();
      setProducts(data);
    } catch (err) {
      setError('Error al cargar productos');
    }
  };

  const handleExport = async () => {
    try {
      setError('');
      const { data } = await inventoryApi.exportLowStock();
      setSuccess('CSV generado con éxito');
      // Descargar el archivo
      const link = document.createElement('a');
      link.href = `${API_BASE_URL}/exports/${data.filename}`;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al exportar CSV');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Productos Bajo Stock</h1>
        <button className="btn btn-primary" onClick={handleExport}>
          Exportar CSV
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {products.length === 0 ? (
        <p>No hay productos con stock bajo.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Stock</th>
              <th>P.Venta</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <ProductRow key={product._id} product={product} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LowStockPage;
