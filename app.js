// Import express and path modules
const express = require('express');
const path = require('path');

// Create express app
const app = express();

// Load .env
require("dotenv").config();

// MongoDB
const mongoose = require("mongoose");

// Handlebars engine
const { engine } = require('express-handlebars');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// FIX: Prevent favicon.ico crash on deployment
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Import routes
const a1Routes = require('./routes/a1Routes');
const airbnbApiRoutes = require("./routes/airbnbApi");

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Setup Handlebars
app.engine('.hbs', engine({
  extname: '.hbs',
  helpers: {
    checkName: function(name) {
      return name && name.trim() !== '' ? name : 'N/A';
    }
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// =============================
// MongoDB Connection
// =============================
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => console.log("MongoDB Connected!"))
.catch(err => console.error("MongoDB Error:", err));

// =============================
// Routes
// =============================

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: "Home Page" });
});

// Assignment 1 routes
app.use('/', a1Routes);

// API routes
app.use('/api/airbnb', airbnbApiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Error', 
    message: 'Route Not Found'
  });
});

// =============================
// Start server
// =============================
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});