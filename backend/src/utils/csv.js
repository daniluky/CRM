const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

exports.exportToCsv = async (data, filename) => {
  const csvWriter = createCsvWriter({
    path: path.join(__dirname, '..', '..', 'exports', filename),
    header: [
      { id: 'barcode', title: 'CÓDIGO' },
      { id: 'name', title: 'NOMBRE' },
      { id: 'stock_qty', title: 'STOCK' },
      { id: 'location', title: 'UBICACIÓN' },
      { id: 'sale_price', title: 'PRECIO VENTA' }
    ]
  });

  await csvWriter.writeRecords(data);
  return path.join(__dirname, '..', '..', 'exports', filename);
};
