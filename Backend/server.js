const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all origins (for development purposes)
app.use(cors());

// Set up multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Store the files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a unique timestamp to the file name
  }
});

const upload = multer({ storage: storage });

// Create the upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.send({ message: 'File uploaded successfully', file: req.file });
});

// Serve static files from the 'uploads' directory (optional)
app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
