
// Import express and path modules
var express = require('express');
var path = require('path');

// Create express app
var app = express();

// Load .env
require("dotenv").config();

// MongoDB
const mongoose = require("mongoose");

// Import Handlebars engine
const { engine } = require('express-handlebars');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Import routes
const a1Routes = require('./routes/a1Routes');
const airbnbApiRoutes = require("./routes/airbnbApi");
app.use("/api/airbnb", airbnbApiRoutes);



// Set port
const port = process.env.PORT || 3000;

// Serve static files (CSS, images, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Setup Handlebars engine
app.engine('.hbs', engine({
  extname: '.hbs',
  helpers: {
    checkName: function(name) {
      return name && name.trim() !== '' ? name : 'N/A';
    }
  }
}));

// Set Handlebars as view engine
app.set('view engine', 'hbs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4
})
.then(() => console.log("MongoDB Connected!"))
.catch(err => console.error("MongoDB Error:", err));

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page' });
});

// Use Assignment routes
app.use('/', a1Routes);

// Error route for invalid URLs
app.use((req, res) => {
  res.render('error', { title: 'Error', message: 'Wrong Route' });
});

// Start server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
