import React, { useState, useRef, useEffect, useMemo } from 'react';
import { productsApi, inventoryApi } from '../api/client';
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

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + (line.product.sale_price * line.qty), 0),
    [lines]
  );

  const totalItems = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty, 0),
    [lines]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) return;

    try {
      setError('');
      const { data: product } = await productsApi.getByBarcode(trimmedBarcode);

      setCompletedSale(null);
      setLines(prevLines => {
        const existingLine = prevLines.find(l => l.product.barcode === product.barcode);
        if (existingLine) {
          return prevLines.map(line =>
            line.product.barcode === product.barcode
              ? { ...line, qty: line.qty + 1 }
              : line
          );
        }
        return [...prevLines, { product, qty: 1 }];
      });

      inputRef.current?.focus();
      setBarcode('');
    } catch (err) {
      setError('Producto no encontrado');
      setBarcode('');
    }
  };

  const handleQuantityChange = (productToUpdate, newQty) => {
    if (newQty < 1) return;
    setCompletedSale(null);
    setLines(prevLines => (
      prevLines.map(line =>
        line.product.barcode === productToUpdate.barcode
          ? { ...line, qty: newQty }
          : line
      )
    ));
  };

  const handleDelete = (productToRemove) => {
    setCompletedSale(null);
    setLines(prevLines => prevLines.filter(
      line => line.product.barcode !== productToRemove.barcode
    ));
  };

  const handleClearCart = () => {
    setCompletedSale(null);
    setError('');
    setSuccess('');
    setLines([]);
    inputRef.current?.focus();
  };

  const handleCompleteSale = async () => {
    if (!lines.length) return;

    try {
      setError('');
      setSuccess('');
      const { data } = await inventoryApi.sale({
        lines: lines.map(line => ({
          barcode: line.product.barcode,
          qty: line.qty
        }))
      });

      setCompletedSale(data);
      setSuccess('Venta realizada con éxito');
      setLines([]);
      inputRef.current?.focus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la venta');
    }
  };

  return (
    <div className="card sales-page">
      <header className="sales-header">
        <div>
          <h1 className="sales-title">Nueva Venta</h1>
          <p className="sales-subtitle">
            Escanea los productos y controla el carrito en tiempo real antes de finalizar la venta.
          </p>
        </div>
        <div className="sales-metrics">
          <div className="sales-metric">
            <span className="sales-metric-label">Artículos</span>
            <span className="sales-metric-value">{totalItems}</span>
          </div>
          <div className="sales-metric">
            <span className="sales-metric-label">Productos únicos</span>
            <span className="sales-metric-value">{lines.length}</span>
          </div>
          <div className="sales-metric">
            <span className="sales-metric-label">Importe</span>
            <span className="sales-metric-value">{total.toFixed(2)} €</span>
          </div>
        </div>
      </header>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="sales-layout">
        <section className="sales-main">
          <div className="sales-block">
            <div className="sales-block-header">
              <div>
                <h2>Agregar producto</h2>
                <p className="sales-block-subtitle">
                  Introduce manualmente el código o utiliza el lector para añadirlo al carrito.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="sales-form">
              <div className="sales-input-wrapper">
                <input
                  ref={inputRef}
                  id="barcode"
                  className="sales-input"
                  type="text"
                  placeholder="Introduce o escanea el código de barras"
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  Añadir
                </button>
              </div>
            </form>
          </div>

          <div className="sales-block">
            <div className="sales-block-header">
              <div>
                <h2>Carrito activo</h2>
                <p className="sales-block-subtitle">
                  Ajusta cantidades antes de confirmar la venta.
                </p>
              </div>
              {lines.length > 0 && (
                <button type="button" className="sales-clear-btn" onClick={handleClearCart}>
                  Vaciar carrito
                </button>
              )}
            </div>

            {lines.length > 0 ? (
              <ul className="sales-cart-list">
                {lines.map(line => {
                  const lineKey = line.product._id || line.product.barcode;
                  const lineSubtotal = line.product.sale_price * line.qty;

                  return (
                    <li key={lineKey} className="sales-cart-item">
                      <div className="sales-cart-info">
                        <span className="sales-cart-name">{line.product.name}</span>
                        <span className="sales-cart-barcode">{line.product.barcode}</span>
                      </div>
                      <div className="sales-cart-qty">
                        <button
                          type="button"
                          className="sales-qty-btn"
                          onClick={() => handleQuantityChange(line.product, line.qty - 1)}
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          className="sales-qty-input"
                          value={line.qty}
                          onChange={e => {
                            const parsed = parseInt(e.target.value, 10);
                            handleQuantityChange(line.product, Number.isNaN(parsed) ? line.qty : parsed);
                          }}
                          aria-label={`Cantidad para ${line.product.name}`}
                        />
                        <button
                          type="button"
                          className="sales-qty-btn"
                          onClick={() => handleQuantityChange(line.product, line.qty + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                      <div className="sales-cart-price">
                        <span className="sales-cart-unit">{line.product.sale_price.toFixed(2)} €</span>
                        <span className="sales-cart-subtotal">{lineSubtotal.toFixed(2)} €</span>
                      </div>
                      <button
                        type="button"
                        className="sales-cart-remove"
                        onClick={() => handleDelete(line.product)}
                      >
                        Eliminar
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="sales-empty">
                <h3>Carrito vacío</h3>
                <p>Escanea el primer producto o añádelo manualmente para comenzar la venta.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="sales-summary">
          <div className="sales-block sales-summary-card">
            <h2>Resumen</h2>
            <div className="sales-summary-content">
              <div className="sales-summary-row">
                <span className="sales-summary-label">Productos únicos</span>
                <span className="sales-summary-value">{lines.length}</span>
              </div>
              <div className="sales-summary-row">
                <span className="sales-summary-label">Artículos totales</span>
                <span className="sales-summary-value">{totalItems}</span>
              </div>
              <div className="sales-summary-row sales-summary-total">
                <span className="sales-summary-label">Importe total</span>
                <span className="sales-summary-value">{total.toFixed(2)} €</span>
              </div>
            </div>
            <button
              className="btn btn-primary sales-complete-btn"
              onClick={handleCompleteSale}
              disabled={!lines.length}
              type="button"
            >
              Finalizar venta
            </button>
          </div>

          {completedSale && (
            <div className="sales-ticket-container">
              <SaleTicket {...completedSale} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default SalesPage;
