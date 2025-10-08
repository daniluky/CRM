import React from 'react';
import { NavLink } from 'react-router-dom';

function TopBar() {
  return (
    <header className="top-bar">
      <nav className="nav">
        <NavLink to="/" end>Ventas</NavLink>
        <NavLink to="/new-product">Nuevo Producto</NavLink>
        <NavLink to="/inventory">Inventario</NavLink>
        <NavLink to="/low-stock">Bajo Stock</NavLink>
        <NavLink to="/return">Devolución</NavLink>
      </nav>
    </header>
  );
}

export default TopBar;
