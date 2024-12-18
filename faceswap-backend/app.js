const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const API_URL = 'https://api.magicapi.dev/api/v1/magicapi/faceswap-v2/faceswap/image/run';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// FaceSwap endpoint to handle image swapping
app.post('/faceswap', upload.fields([{ name: 'swap_image' }, { name: 'target_image' }]), async (req, res) => {
    const swapImage = req.files['swap_image'][0].path;
    const targetImage = req.files['target_image'][0].path;

    console.log(`Received files: swap_image=${swapImage}, target_image=${targetImage}`);

    // Check if files exist and are in valid formats
    if (!fs.existsSync(swapImage) || !fs.existsSync(targetImage)) {
        return res.status(400).json({ error: 'Invalid file paths' });
    }

    // Prepare form data for multipart/form-data
    const formData = new FormData();
    formData.append('swap_image', fs.createReadStream(swapImage));  // fs.createReadStream to read the file
    formData.append('target_image', fs.createReadStream(targetImage));

    console.log('FormData headers:', formData.getHeaders());  // Log FormData headers

    try {
        const response = await axios.post(
            API_URL,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),  // FormData automatically sets correct content-type
                    "x-magicapi-key": API_KEY,  // API Key header
                }
            }
        );

        console.log('FaceSwap API response:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error during FaceSwap API call:', error);

        if (error.response) {
            console.error('Error response from API:', error.response.data);
            res.status(error.response.status).json({ error: error.response.data });
        } else if (error.request) {
            console.error('No response received from API:', error.request);
            res.status(500).json({ error: 'No response received from FaceSwap API.' });
        } else {
            console.error('Error setting up the request:', error.message);
            res.status(500).json({ error: 'An error occurred while setting up the request.' });
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
