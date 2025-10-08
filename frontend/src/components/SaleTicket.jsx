import React from 'react';

function SaleTicket({ lines, total }) {
  return (
    <div className="card" style={{ width: '300px', margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>TICKET DE VENTA</h2>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Fecha:</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
      </div>
      <table style={{ marginBottom: '1rem' }}>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={i}>
              <td>{line.product.name}</td>
              <td>{line.qty}</td>
              <td>{line.product.sale_price.toFixed(2)} €</td>
              <td>{line.total.toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ 
        borderTop: '1px solid var(--gray-200)',
        paddingTop: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: 'bold'
      }}>
        <span>TOTAL</span>
        <span>{total.toFixed(2)} €</span>
      </div>
    </div>
  );
}

export default SaleTicket;
