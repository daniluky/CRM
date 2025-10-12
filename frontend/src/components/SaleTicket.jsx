import React, { useMemo } from 'react';

function SaleTicket({ lines, total }) {
  const formattedDate = useMemo(() => new Date().toLocaleString(), []);

  return (
    <div className="sales-ticket">
      <div className="sales-ticket-header">
        <h3>Ticket de venta</h3>
        <span className="sales-ticket-date">{formattedDate}</span>
      </div>

      <div className="sales-ticket-items">
        {lines.map((line, index) => (
          <div key={`${line.product.id || line.product.name}-${index}`} className="sales-ticket-item">
            <div>
              <p className="sales-ticket-name">{line.product.name}</p>
              <span className="sales-ticket-meta">
                x{line.qty} | {line.product.sale_price.toFixed(2)} €
              </span>
            </div>
            <span className="sales-ticket-amount">{line.total.toFixed(2)} €</span>
          </div>
        ))}
      </div>

      <div className="sales-ticket-total">
        <span>Total</span>
        <span>{total.toFixed(2)} €</span>
      </div>
    </div>
  );
}

export default SaleTicket;
