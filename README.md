# Express.js CRUD Sample

A simple Express.js application demonstrating CRUD operations using in-memory storage.
Also support real-time updates using Supabase.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Endpoints

- GET `/api/items` - Get all items
- GET `/api/items/:id` - Get a single item
- POST `/api/items` - Create a new item
- PUT `/api/items/:id` - Update an item
- DELETE `/api/items/:id` - Delete an item

## Request Examples

### Create Item

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "New Item", "description": "Description here"}'
```

### Get All Items

```bash
curl http://localhost:3000/api/items
```

### Update Item

```bash
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item"}'
```

### Delete Item

```bash
curl -X DELETE http://localhost:3000/api/items/1
```
