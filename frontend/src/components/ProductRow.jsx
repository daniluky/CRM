import React from 'react';

// ProductRow muestra la información de un producto en tablas reutilizables
function ProductRow({ product, onDelete, onQuantityChange }) {
  return (
    <tr>
      <td>{product.barcode}</td>
      <td>{product.name}</td>
      <td>
        {onQuantityChange ? (
          <input
            type="number"
            min="1"
            value={product.qty || 1}
            onChange={(e) => {
              const newValue = parseInt(e.target.value, 10) || 1;
              if (newValue > 0) {
                onQuantityChange(product, newValue);
              }
            }}
            style={{ width: '80px' }}
          />
        ) : (
          product.stock_qty
        )}
      </td>
      <td>{product.sale_price.toFixed(2)} €</td>
      {onDelete && (
        <td>
          <button
            onClick={() => onDelete(product)}
            className="btn btn-danger"
          >
            Eliminar
          </button>
        </td>
      )}
    </tr>
  );
}

export default ProductRow;
