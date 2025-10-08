import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api/client';

function NewProductPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    base_price: '',
    price_mode: 'auto',
    sale_price: '',
    initial_stock: '',
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Si el precio base cambia y estamos en modo auto, calcular precio venta
      ...(name === 'base_price' && prev.price_mode === 'auto' 
        ? { sale_price: (parseFloat(value) * 1.35).toFixed(1) }
        : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');

      const payload = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        sale_price: parseFloat(formData.sale_price),
        initial_stock: formData.initial_stock ? parseInt(formData.initial_stock) : undefined
      };

      await productsApi.create(payload);
      navigate('/inventory');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el producto');
    }
  };

  return (
    <div className="card">
      <h1>Nuevo Producto</h1>
      
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre*</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="barcode">Código de barras*</label>
          <input
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="base_price">Precio base*</label>
          <input
            id="base_price"
            name="base_price"
            type="number"
            step="0.01"
            value={formData.base_price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price_mode">Modo de precio</label>
          <select
            id="price_mode"
            name="price_mode"
            value={formData.price_mode}
            onChange={handleChange}
          >
            <option value="auto">Automático (35%)</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="sale_price">Precio de venta*</label>
          <input
            id="sale_price"
            name="sale_price"
            type="number"
            step="0.1"
            value={formData.sale_price}
            onChange={handleChange}
            disabled={formData.price_mode === 'auto'}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="initial_stock">Stock inicial</label>
          <input
            id="initial_stock"
            name="initial_stock"
            type="number"
            value={formData.initial_stock}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Ubicación</label>
          <input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ej: Estantería A3"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Crear Producto
        </button>
      </form>
    </div>
  );
}

export default NewProductPage;
