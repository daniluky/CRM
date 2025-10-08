import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import SalesPage from './pages/SalesPage';
import NewProductPage from './pages/NewProductPage';
import InventoryPage from './pages/InventoryPage';
import LowStockPage from './pages/LowStockPage';
import ReturnPage from './pages/ReturnPage';

function App() {
  return (
    <div className="app">
      <TopBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<SalesPage />} />
          <Route path="/new-product" element={<NewProductPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/low-stock" element={<LowStockPage />} />
          <Route path="/return" element={<ReturnPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
