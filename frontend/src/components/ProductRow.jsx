import React from 'react';

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
            value={product.qty}
            onChange={(e) => onQuantityChange(product, parseInt(e.target.value))}
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
