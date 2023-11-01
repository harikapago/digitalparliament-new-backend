const express = require('express');
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;

// Define a Mongoose schema for the registration collection
const registrationSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  MobileNumber: String,
  password: String,
  DOB: Date,
  gender: String,
});

// Create a Mongoose model based on the schema
const Registration = mongoose.model('Registration', registrationSchema);

// Connect to MongoDB
mongoose.connect("mongodb://nodebackend-for-dpapp-server:gWvKSCn8OvkfVvYzgBqtQ4YeaNjfhppkBtLwchLs5kiGZes901NUq8v0KheDNZVJRvci1lhMnIuBACDbixqp1Q==@nodebackend-for-dpapp-server.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@nodebackend-for-dpapp-server@")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Handle POST request to create a new registration
app.post('/registration', async (req, res) => {
  const { MobileNumber } = req.body;

  try {
    // Check if a registration with the given MobileNumber already exists
    const existingRegistration = await Registration.findOne({ MobileNumber });
    
    if (existingRegistration) {
      // Registration with the same MobileNumber already exists
      return res.status(400).json({ error: 'MobileNumber already registered' });
    }
    
    // If no existing registration, create and save the new registration
    const newRegistration = new Registration(req.body);
    const savedRegistration = await newRegistration.save();
    res.json(savedRegistration);
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, Digital Parliament world');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
