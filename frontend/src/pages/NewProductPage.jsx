import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api/client';

function NewProductPage() {
  const navigate = useNavigate();
  const nameInputRef = useRef(null);
  const basePriceRef = useRef(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    description: '',
    base_price: '',
    price_mode: 'auto',
    sale_price: '',
    initial_stock: ''
  });

  const basePrice = useMemo(
    () => (formData.base_price ? parseFloat(formData.base_price) : 0),
    [formData.base_price]
  );
  const salePrice = useMemo(
    () => (formData.sale_price ? parseFloat(formData.sale_price) : 0),
    [formData.sale_price]
  );
  const marginAmount = useMemo(() => {
    if (!basePrice || !salePrice) return null;
    return salePrice - basePrice;
  }, [basePrice, salePrice]);
  const marginPercent = useMemo(() => {
    if (!basePrice || !salePrice || marginAmount === null) return null;
    return (marginAmount / basePrice) * 100;
  }, [basePrice, salePrice, marginAmount]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData(prev => {
      if (name === 'barcode') {
        return { ...prev, barcode: value.trim() ? value : value };
      }

      if (name === 'price_mode') {
        const nextMode = value;
        const autoValue =
          nextMode === 'auto' && prev.base_price
            ? Math.round(parseFloat(prev.base_price) * 1.35 * 10) / 10
            : prev.sale_price;
        return { ...prev, price_mode: nextMode, sale_price: autoValue.toString() };
      }

      if (name === 'base_price') {
        const autoValue =
          prev.price_mode === 'auto' && value
            ? Math.round(parseFloat(value) * 1.35 * 10) / 10
            : prev.sale_price;
        return { ...prev, base_price: value, sale_price: autoValue.toString() };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleBarcodeKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      nameInputRef.current?.focus();
    }
  };

  const handleNameKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      basePriceRef.current?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      setSuccess('');

      const payload = {
        ...formData,
        barcode: formData.barcode.trim(),
        base_price: formData.base_price ? parseFloat(formData.base_price) : undefined,
        sale_price: formData.sale_price ? Math.round(parseFloat(formData.sale_price) * 10) / 10 : undefined,
        initial_stock: formData.initial_stock ? parseInt(formData.initial_stock, 10) : 0
      };

      await productsApi.create(payload);
      // Limpiar el formulario para el siguiente producto
      setFormData({
        barcode: '',
        name: '',
        description: '',
        base_price: '',
        price_mode: 'auto',
        sale_price: '',
        initial_stock: ''
      });
      setSuccess('Producto guardado correctamente');
      // Enfocar el campo de código de barras para el siguiente producto
      document.getElementById('barcode')?.focus();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el producto');
    }
  };

  const isAuto = formData.price_mode === 'auto';

  return (
    <div className="product-quick">
      <header className="product-quick__header">
        <div>
          <h1>Alta rápida de producto</h1>
          <p>Escanea el código, completa los campos básicos y guarda el producto en segundos.</p>
        </div>
        <button type="button" className="btn" onClick={() => navigate(-1)}>
          Volver
        </button>
      </header>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form className="product-quick__form" onSubmit={handleSubmit}>
        <section className="product-quick__section">
          <div className="form-group">
            <label htmlFor="barcode">Código de barras*</label>
            <input
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="Escanea o escribe el código"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Nombre*</label>
            <input
              ref={nameInputRef}
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onKeyDown={handleNameKeyDown}
              placeholder="Ej: Cocacola"
              required
            />
          </div>

          <div className="product-quick__grid">
            <div className="form-group">
              <label htmlFor="base_price">Precio base*</label>
              <input
                ref={basePriceRef}
                id="base_price"
                name="base_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.base_price}
                onChange={handleChange}
                placeholder="0.00"
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
              <label htmlFor="sale_price">Precio venta*</label>
              <input
                id="sale_price"
                name="sale_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.sale_price}
                onChange={handleChange}
                disabled={isAuto}
                placeholder="0.00"
                required
              />
              <span className="product-quick__hint">
                {isAuto ? 'Se calcula automáticamente con un margen del 35%.' : 'Introduce el precio final.'}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="initial_stock">Stock inicial</label>
              <input
                id="initial_stock"
                name="initial_stock"
                type="number"
                min="0"
                value={formData.initial_stock}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="product-quick__grid">
            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Notas internas o detalles relevantes"
              />
            </div>
          </div>
        </section>

        <section className="product-quick__summary">
          <div>
            <span className="product-quick__summary-label">Margen estimado</span>
            <strong className="product-quick__summary-value">
              {marginAmount !== null
                ? `${marginAmount.toFixed(2)} €${marginPercent !== null ? ` (${marginPercent.toFixed(1)}%)` : ''}`
                : '---'}
            </strong>
          </div>
          <div>
            <span className="product-quick__summary-label">Stock al crear</span>
            <strong className="product-quick__summary-value">
              {formData.initial_stock || '0'} unidades
            </strong>
          </div>
        </section>

        <div className="product-quick__actions">
          <button type="submit" className="btn btn-primary">
            Guardar producto
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewProductPage;
