# 🚀 Quick Start Guide - GastroChef

## Prerequisites
- **Node.js** v16+ installed
- **MongoDB** running locally OR MongoDB Atlas connection string
- **npm** or **yarn**

---

## ⚡ 5-Minute Setup

### 1️⃣ Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup .env file (if not already done)
# Edit .env and set:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/gastro-chef
# JWT_SECRET=your_secret_key_here

# Seed the database with recipes & ingredients
npm run seed

# Start the server
npm run dev
```

✅ Backend should be running on: **http://localhost:5000**

---

### 2️⃣ Frontend (in a new terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies  
npm install

# Start dev server
npm run dev
```

✅ Frontend should open at: **http://localhost:5173**

---

## 🎮 First Steps

1. **Register** a new account
   - Restaurant Name: e.g., "La Tour d'Émeraude"
   - Email: e.g., "chef@restaurant.com"
   - Password: "password123"

2. **Go to Lab**
   - Click on available ingredients
   - Try combinations like: `Tomato` + `Mozzarella` + `Basil` + `Olive Oil`
   - Click "Experiment"
   - ✅ Success! Recipe "Caprese Salad" discovered!

3. **View Your Recipes**
   - Click "📖 My Recipes" to see discovered recipes
   - See ingredient requirements and difficulty

---

## 🔧 Troubleshooting

### MongoDB Connection Error
- ❌ `ECONNREFUSED 127.0.0.1:27017`
- ✅ Make sure MongoDB is running:
  ```bash
  # Windows (if installed)
  net start MongoDB
  
  # macOS
  brew services start mongodb-community
  
  # Or use MongoDB Atlas cloud
  # Update MONGO_URI in .env
  ```

### Port Already in Use
- ❌ `Error: listen EADDRINUSE :::5000`
- ✅ Change PORT in `.env` or kill the process:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### CORS Error
- ✅ Make sure frontend and backend are on correct URLs
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 📝 Default Test Recipes (After Seed)

After running `npm run seed`, try these ingredient combinations:

| Recipe | Ingredients | Result |
|--------|-----------|--------|
| **Caprese Salad** | Tomato, Mozzarella, Basil, Olive Oil | ✅ Easy |
| **Spaghetti Carbonara** | Pasta, Cream, Parmesan, Salt, Pepper | ✅ Medium |
| **Garlic Chicken** | Chicken, Garlic, Olive Oil, Salt, Pepper | ✅ Easy |
| **Beef Burger** | Beef, Onion, Salt, Pepper | ✅ Easy |
| **Creamy Mushroom Pasta** | Pasta, Cream, Butter, Garlic | ✅ Medium |

---

## 📚 Documentation

- **Full README**: See [README.md](./README.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Docs**: See routes in `backend/routes/`

---

## 🐛 Report Issues

- Check MongoDB connection
- Verify `.env` files are configured
- Check browser console for frontend errors
- Check terminal logs for backend errors

---

**Happy cooking! 🍽️**
