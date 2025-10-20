import React, { useState, useEffect } from 'react';
import { productsApi, inventoryApi } from '../api/client';

// InventoryPage administra el listado y las operaciones sobre el stock
function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState({ qty: '', note: '' });

  // Recarga productos cada vez que cambia el término de búsqueda
  useEffect(() => {
    loadProducts();
  }, [search]);

  // loadProducts obtiene los productos del backend con el filtro actual
  const loadProducts = async () => {
    try {
      const { data } = await productsApi.list({ query: search });
      setProducts(data);
    } catch (err) {
      setError('Error al cargar productos');
    }
  };

  // handleMovement ejecuta entradas, ajustes o devoluciones usando el modal
  const handleMovement = async (type) => {
    if (!selectedProduct || !modalData.qty) return;

    try {
      setError('');
      const endpoint = type === 'arrival' ? inventoryApi.arrival :
        type === 'return' ? inventoryApi.return :
          inventoryApi.adjust;

      let payload;
      if (type === 'adjust') {
        payload = {
          productId: selectedProduct._id,
          qtyDelta: parseInt(modalData.qty, 10),
          note: modalData.note || 'Ajuste de inventario'
        };
      } else if (type === 'arrival') {
        payload = {
          productId: selectedProduct._id,
          qty: parseInt(modalData.qty, 10),
          note: modalData.note || 'Entrada de stock'
        };
      } else {
        payload = {
          productId: selectedProduct._id,
          qty: parseInt(modalData.qty, 10),
          note: modalData.note || 'Devolución'
        };
      }

      await endpoint(payload);
      setSuccess('Operación realizada con éxito');
      setTimeout(() => setSuccess(''), 3000);
      loadProducts();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la operación');
    }
  };

  // openModal prepara los datos necesarios para operar sobre un producto
  const openModal = (type, product) => {
    setSelectedProduct(product);
    setModalType(type);
    setModalData({ qty: '', note: '' });
  };

  // closeModal restablece el estado del modal sin aplicar cambios
  const closeModal = () => {
    setSelectedProduct(null);
    setModalType(null);
    setModalData({ qty: '', note: '' });
  };

  // handleDelete confirma y elimina un producto definitivamente
  const handleDelete = async (product) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?`)) {
      return;
    }

    try {
      setError('');
      await productsApi.delete(product._id);
      setSuccess('Producto eliminado correctamente');
      setTimeout(() => setSuccess(''), 3000);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el producto');
    }
  };

  return (
    <div className="card">
      <h1>Inventario</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="form-group">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Stock</th>
            <th>P.Venta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.barcode}</td>
              <td>{product.name}</td>
              <td>{product.stock_qty}</td>
              <td>{product.sale_price.toFixed(2)} €</td>
              <td style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => openModal('arrival', product)}
                >
                  +Stock
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => openModal('adjust', product)}
                >
                  Ajustar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(product)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalType && selectedProduct && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '400px' }}>
            <h2>
              {modalType === 'arrival' ? 'Entrada de Stock' :
                modalType === 'adjust' ? 'Ajuste de Stock' :
                  'Devolución'}
            </h2>
            <p>Producto: {selectedProduct.name}</p>

            <div className="form-group">
              <label>
                {modalType === 'adjust' ? 'Ajuste' : 'Cantidad'}
              </label>
              <input
                type="number"
                value={modalData.qty}
                onChange={e => setModalData({ ...modalData, qty: e.target.value })}
                placeholder={modalType === 'adjust' ? "Positivo suma, negativo resta" : ""}
              />
            </div>

            <div className="form-group">
              <label>Nota</label>
              <input
                type="text"
                value={modalData.note}
                onChange={e => setModalData({ ...modalData, note: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={closeModal}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleMovement(modalType)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
