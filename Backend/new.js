const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const FormData = require('form-data');

const app = express();
const port = 3000;

// Roboflow API details
const apiUrl = "https://detect.roboflow.com/electric_meters-qlsga/1";
const apiKey = "VpznSt9HarP0a8U7w0hH";

// Base directory for predefined images
const baseDirectory = path.resolve(__dirname, 'uploads');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// *GET Method*: Choose a target image by name
app.get('/process-image', async (req, res) => {
    try {
        // Get the image name from query parameters
        const imageName = req.query.imageName;

        if (!imageName) {
            return res.status(400).json({ error: 'Image name is required' });
        }

        // Dynamically construct the image path
        const imagePath = path.join(baseDirectory, imageName);

        // Check if the image exists
        if (!fs.existsSync(imagePath)) {
            return res.status(400).json({ error: `Image not found: ${imageName}` });
        }

        console.log('Processing image via GET:', imagePath);

        // Prepare the file for upload
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));

        // Call the Roboflow API
        const response = await axios.post(`
            ${apiUrl}?api_key=${apiKey}`,
            formData,
            {
                headers: formData.getHeaders(),
            }
        );

        console.log('API Response:', response.data);

        // Process the response
        const predictions = response.data.predictions;
        const sortedPredictions = predictions.sort((a, b) => a.x - b.x);
        const sortedClasses = sortedPredictions.map((prediction) => prediction.class);
        const outputString = sortedClasses.join('');
        const outputNumber = parseInt(outputString, 10);

        res.json({output: outputNumber });
    } catch (error) {
        console.error('Error during GET processing:', error.message);
        res.status(500).json({ error: 'Failed to process the image via GET' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`GET Method: http://localhost:${port}/process-image?imageName=123.jpg`);
    console.log(`POST Method: Upload an image via form-data with the key 'image'`);
});
