# CampusPulse Backend

A professional Node.js/Express backend with PostgreSQL database using Knex.js migrations.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=campuspulse
DB_PASSWORD=your_password
DB_PORT=5432
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3001
```

### 3. Run Database Migrations
```bash
npm run migrate
```
This will create all required tables automatically.

### 4. Start the Server
```bash
npm start
```

Server runs on `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── index.js                    # Main server entry point
├── knexfile.js                 # Knex.js configuration
├── package.json
├── .env                        # Environment variables (not in git)
├── database/
│   ├── db.js                   # PostgreSQL connection pool
│   ├── migrations/             # Database migrations
│   │   ├── 001_create_users_table.js
│   │   ├── 002_create_events_table.js
│   │   └── 003_create_feedback_table.js
│   └── runMigrations.js        # Migration runner
├── routes/
│   ├── auth.js                 # Authentication routes
│   ├── user.js                 # User routes
│   └── admin.js                # Admin routes
├── controllers/
│   ├── authController.js       # Auth logic (register, login, logout)
│   ├── userController.js       # User profile logic
│   └── adminController.js      # Admin actions (create events)
└── middleware/
    └── authMiddleware.js        # JWT authentication & authorization
```

## 🗄️ Database Schema

The database uses **migrations** to manage schema. All tables are created automatically via migrations:

### Tables:
- **users** - User accounts and authentication
- **events** - Campus events (created by admins)
- **feedback** - User feedback submissions

### Migration Commands:
```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:rollback
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
  ```json
  { "username": "john", "email": "john@example.com", "password": "password123" }
  ```
- `POST /api/auth/login` - Login (returns JWT tokens)
  ```json
  { "email": "john@example.com", "password": "password123" }
  ```
- `POST /api/auth/refresh` - Refresh access token
  ```json
  { "token": "refresh_token_here" }
  ```
- `POST /api/auth/logout` - Logout (invalidates refresh token)
  ```json
  { "token": "refresh_token_here" }
  ```

### User (`/api/users`)
- `GET /api/users/me` - Get current user profile (requires auth)
  - Headers: `Authorization: Bearer <accessToken>`

### Admin (`/api/admin`)
- `POST /api/admin/add-event` - Create event (requires admin role)
  ```json
  {
    "eventName": "Tech Summit",
    "category": "Technology",
    "date": "March 15, 2025",
    "time": "10:00 AM",
    "location": "Main Auditorium",
    "organizer": "Tech Club",
    "description": "Event description",
    "image": "/image.jpg",
    "deadline": "March 10, 2025"
  }
  ```

## 🔗 Frontend Integration

The frontend connects to the backend via:
- **Base URL**: `http://localhost:3001` (configured in frontend `.env.local` as `NEXT_PUBLIC_API_URL`)
- **Authentication**: JWT tokens stored in localStorage
- **Headers**: `Authorization: Bearer <accessToken>` for protected routes

## 🛠️ Development

### Adding a New Migration
```bash
# Create a new migration file
knex migrate:make migration_name --knexfile knexfile.js

# Edit the generated file in database/migrations/
# Then run: npm run migrate
```

### Database Connection
The app uses a PostgreSQL connection pool. Connection settings are in `.env` and `knexfile.js`.

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_HOST` | Database host | `localhost` |
| `DB_DATABASE` | Database name | `campuspulse` |
| `DB_PASSWORD` | PostgreSQL password | *required* |
| `DB_PORT` | Database port | `5432` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | *required* |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | *required* |
| `PORT` | Server port | `3001` |

## ✨ Features

- ✅ Professional migration-based database schema
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (user/admin)
- ✅ RESTful API design
- ✅ PostgreSQL with connection pooling
- ✅ Environment-based configuration
