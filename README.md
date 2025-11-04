# 🔄 SlotSwapper - Peer-to-Peer Time Slot Scheduler

A full-stack application that allows users to exchange time slots with each other. Users can mark their calendar events as "swappable" and request to swap slots with other users, with real-time notifications.

![SlotSwapper Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based authentication
- 📅 **Calendar Management** - CRUD operations for events
- 🔄 **Swap Logic** - Request, accept, or reject time slot swaps
- 🔔 **Real-time Notifications** - WebSocket-powered instant updates
- 🎨 **Beautiful UI** - Modern gradient design with smooth transitions
- 📱 **Responsive Layout** - Works on desktop and mobile
- 🧪 **Well Tested** - Comprehensive unit and integration tests
- 🐳 **Docker Ready** - Easy containerization
- ☁️ **Cloud Database** - Supabase PostgreSQL integration

## 🚀 Quick Start with Supabase (Recommended)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (free)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SlotSwapper
   ```

2. **Set up Supabase** (5 minutes)
   - Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a free Supabase project
   - Get your database connection string
   - Configure your `.env` file

3. **Install dependencies and run migrations**
   ```bash
   # Backend
   cd backend
   npm install
   npm run migrate
   npm run dev
   
   # Frontend (in a new terminal)
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🗄️ Database Options

### Option 1: Supabase (Recommended)
- ✅ No local setup required
- ✅ Works on Windows, Mac, Linux
- ✅ Same database for dev and production
- ✅ Free tier includes 500MB database
- 📚 See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup

### Option 2: Local PostgreSQL with Docker
```bash
# Start local database
docker-compose --profile local-db up db

# In another terminal
cd backend
npm install
npm run migrate
npm run dev
```

### Option 3: Manual PostgreSQL Installation
See [SETUP.txt](./SETUP.txt) for detailed instructions.

## 📋 Technology Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (via Supabase)
- JWT authentication
- Socket.io for real-time notifications
- Jest for testing

### Frontend
- React + TypeScript
- Vite build tool
- React Router for navigation
- Axios for API calls
- Socket.io-client for WebSockets
- React Toastify for notifications

## 🧪 Running Tests

```bash
cd backend
npm test                 # Run all tests
npm test -- --coverage   # Run with coverage report
npm run test:watch       # Run in watch mode
```

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Run without local database (using Supabase)
docker-compose up backend frontend
```

## 📦 Deployment

### Backend (Render/Heroku/Railway)
1. Create a new web service
2. Connect your GitHub repository
3. Set environment variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `JWT_SECRET`: A strong random string
   - `CORS_ORIGIN`: Your frontend URL
4. Deploy!

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set environment variables:
   - `VITE_API_URL`: Your backend URL
   - `VITE_WS_URL`: Your backend URL
4. Deploy!

## 📚 Documentation

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Complete Supabase setup guide
- [SETUP.txt](./SETUP.txt) - Local development setup
- [API_DOCUMENTATION.txt](./API_DOCUMENTATION.txt) - API endpoints reference
- [FEATURES.txt](./FEATURES.txt) - Detailed feature list
- [PROJECT_SUMMARY.txt](./PROJECT_SUMMARY.txt) - Project overview

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for stateless authentication
- CORS configured
- SQL injection prevention via parameterized queries
- Input validation on all endpoints
- Authorization checks on protected routes

## 🗂️ Project Structure

```
SlotSwapper/
├── backend/
│   ├── src/
│   │   ├── __tests__/       # Tests
│   │   ├── config/          # Database config
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── migrations/      # Database migrations
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utilities
│   │   ├── socket.ts        # WebSocket setup
│   │   └── server.ts        # Express server
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
├── SUPABASE_SETUP.md        # 🌟 Start here!
└── README.md
```

## 🌟 Key Features Explained

### Event Management
- Create, read, update, and delete calendar events
- Mark events as BUSY, SWAPPABLE, or SWAP_PENDING
- View your personal calendar

### Swap Marketplace
- Browse available time slots from other users
- Request to swap your slot with theirs
- Both parties must have compatible time slots

### Real-time Notifications
- Instant notifications when someone requests a swap
- Live updates when swaps are accepted or rejected
- WebSocket connection with automatic reconnection

### Transaction Safety
- Database transactions ensure data integrity
- Status checks prevent race conditions
- Atomic swap operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for learning or your own applications!

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check your `.env` file has the correct `DATABASE_URL`
- Verify your Supabase project is active
- Make sure there are no typos in the connection string

### "Module not found" errors
- Run `npm install` in both backend and frontend directories
- Delete `node_modules` and `package-lock.json`, then reinstall

### Tests failing
- Make sure you're using Node.js v18 or higher
- Run `npm install` to ensure all dependencies are installed

### WebSocket not connecting
- Check that backend and frontend URLs match in `.env` files
- Verify CORS_ORIGIN is set correctly
- Check browser console for specific errors

## 📞 Support

For issues or questions:
1. Check the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide
2. Review [SETUP.txt](./SETUP.txt) for local setup
3. Open an issue on GitHub

---

**Built with ❤️ using React, Node.js, and Supabase**

⭐ Star this repo if you find it helpful!
