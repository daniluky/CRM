const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

// exportToCsv genera un archivo CSV en la carpeta exports y devuelve su ruta
exports.exportToCsv = async (data, filename) => {
  const csvWriter = createCsvWriter({
    path: path.join(__dirname, '..', '..', 'exports', filename),
    header: [
      { id: 'barcode', title: 'CÓDIGO' },
      { id: 'name', title: 'NOMBRE' },
      { id: 'stock_qty', title: 'STOCK' },
      { id: 'sale_price', title: 'PRECIO VENTA' }
    ]
  });

  await csvWriter.writeRecords(data);
  return path.join(__dirname, '..', '..', 'exports', filename);
};
