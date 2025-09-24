# Todo App Backend

A REST API server for the Todo application built with Node.js and Express.

## Features

- ✅ Full CRUD operations for todos
- 🚀 RESTful API design
- 🔄 CORS enabled for frontend integration
- 📝 In-memory data storage
- 🛡️ Error handling middleware
- 📊 Health check endpoint

## API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Todo Operations

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion status

## Request/Response Format

### Create Todo (POST /api/todos)

```json
{
  "text": "Learn Node.js",
  "dueDate": "2025-09-30"
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "text": "Learn Node.js",
    "dueDate": "2025-09-30",
    "completed": false,
    "createdAt": "2025-09-22T10:00:00.000Z"
  },
  "message": "Todo created successfully"
}
```

## Installation & Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. For production:

```bash
npm start
```

The server will run on `http://localhost:5000`

## Project Structure

```
backend/
├── src/
│   ├── middleware/
│   │   ├── errorHandler.js    # Error handling middleware
│   │   └── helpers.js         # Utility middleware
│   ├── models/
│   │   └── todoModel.js       # Todo data model and operations
│   ├── routes/
│   │   └── todoRoutes.js      # Todo API routes
│   └── server.js              # Main server file
├── package.json
└── README.md
```

## Dependencies

- **express**: Web framework for Node.js
- **cors**: Cross-Origin Resource Sharing middleware
- **uuid**: Generate unique IDs for todos

## Dev Dependencies

- **nodemon**: Development server with auto-restart

## CORS Configuration

The server is configured to accept requests from `http://localhost:5173` (Vite default port).

## Error Handling

All API responses follow a consistent format with proper HTTP status codes and error messages.

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] Data validation with Joi/Zod
- [ ] API rate limiting
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] Environment configuration
