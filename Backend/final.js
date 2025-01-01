const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const cors = require('cors');  // Import CORS package

const app = express();
const port = 3000;

// Roboflow API details
const apiUrl = "https://detect.roboflow.com/electric_meters-qlsga/1";
const apiKey = "VpznSt9HarP0a8U7w0hH";

// Configure multer for file uploads (use memory storage to avoid saving to disk)
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS for all origins (you can configure it for specific origins if needed)
app.use(cors());

// Endpoint to upload and process the image
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        // Validate that a file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Prepare the file for the Roboflow API
        const formData = new FormData();
        formData.append('file', req.file.buffer, req.file.originalname); // Pass file buffer directly

        // Send the image to the Roboflow API
        const response = await axios.post(
            `${apiUrl}?api_key=${apiKey}`,
            formData,
            { headers: formData.getHeaders() }
        );

        console.log('API Response:', response.data);

        // Process the response
        const predictions = response.data.predictions;
        const sortedPredictions = predictions.sort((a, b) => a.x - b.x);
        const sortedClasses = sortedPredictions.map((prediction) => prediction.class);
        const outputString = sortedClasses.join('');
        const outputNumber = parseInt(outputString, 10);

        // Send the processed output to the client
        res.json({ output: outputNumber });
    } catch (error) {
        console.error('Error processing the image:', error.message);
        res.status(500).json({ error: 'Failed to process the image' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`POST Method: Upload an image via form-data with the key 'file'`);
});
