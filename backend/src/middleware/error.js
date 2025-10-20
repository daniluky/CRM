// errorHandler centraliza las respuestas ante errores conocidos y genéricos
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Código de barras duplicado',
      details: ['Ya existe un producto con ese código de barras']
    });
  }

  if (err.message === 'STOCK_NEGATIVE') {
    return res.status(400).json({
      error: 'Stock insuficiente',
      details: ['No hay suficiente stock para realizar la venta']
    });
  }

  res.status(500).json({
    error: 'Error del servidor',
    details: [err.message]
  });
};

module.exports = errorHandler;
