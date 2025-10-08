# CRM Inventario y Ventas

Sistema de gestión de inventario y ventas para locutorio. Incluye gestión de productos, ventas con lector de código de barras, y control de stock.

## Requisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)

## Variables de entorno

Copiar `.env.example` a `.env`:

```bash
cp .env.example .env
```

Variables disponibles:
- `MONGO_URI`: URL de conexión a MongoDB (default: mongodb://mongo:27017/crm)
- `PORT`: Puerto para la API (default: 4000)

## Desarrollo local

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Ejecución con Docker

1. Copiar variables de entorno:
```bash
cp .env.example .env
```

2. Levantar servicios:
```bash
docker-compose up -d
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- API: http://localhost:4000

## API Routes

### Productos

- `POST /api/products`
  ```json
  {
    "name": "string",
    "description": "string",
    "barcode": "string",
    "base_price": number,
    "price_mode": "auto"|"manual",
    "sale_price": number,
    "initial_stock": number,
    "location": "string"
  }
  ```

- `GET /api/products?query=&low_stock=`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Inventario

- `POST /api/inventory/arrival`
  ```json
  {
    "barcode": "string",
    "qty": number,
    "note": "string"
  }
  ```

- `POST /api/inventory/sale`
  ```json
  {
    "lines": [{
      "barcode": "string",
      "qty": number
    }]
  }
  ```

- `POST /api/inventory/return`
  ```json
  {
    "barcode": "string",
    "qty": number,
    "note": "string"
  }
  ```

- `POST /api/inventory/adjust`
  ```json
  {
    "productId": "string",
    "qtyDelta": number,
    "note": "string"
  }
  ```

- `GET /api/inventory/low-stock`

### Utilidades

- `GET /api/utils/product-by-barcode/:barcode`

## Notas

- No hay sistema de login - usuario único sin autenticación
- Los precios automáticos se calculan como: `sale_price = round(base_price * 1.35, 1)`
- Stock bajo se considera cuando hay 2 o menos unidades
- No se permite stock negativo en ventas
