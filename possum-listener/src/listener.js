const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve mint.json publicly
app.get('/mint.json', (req, res) => {
  fs.readFile('mint.json', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read file' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// Your existing XRPL code here (unchanged)
require('./xrpl-listener'); // or paste in your code directly

// Start the web server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});