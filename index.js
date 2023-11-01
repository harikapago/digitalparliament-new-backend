const express = require('express');
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;


  mongoose.connect("mongodb://nodebackend-for-dpapp-server:gWvKSCn8OvkfVvYzgBqtQ4YeaNjfhppkBtLwchLs5kiGZes901NUq8v0KheDNZVJRvci1lhMnIuBACDbixqp1Q==@nodebackend-for-dpapp-server.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@nodebackend-for-dpapp-server@")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
// addded azure
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to database');
});

app.get('/', (req, res) => {
    res.send('Hello, Digital Parliament world');
  });


// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
