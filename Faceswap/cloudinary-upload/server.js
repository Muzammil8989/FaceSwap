import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Load environment variables from .env file

// Initialize express app
const app = express();

// Enable CORS
app.use(cors());

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up multer storage engine (in-memory storage)
const storage = multer.memoryStorage();

// Multer middleware to handle multiple file fields
const upload = multer({ storage: storage }).fields([
    { name: 'targetImage', maxCount: 1 },
    { name: 'swapImage', maxCount: 1 }
]);

// Upload endpoint (for multiple images upload)
app.post('/upload', upload, async (req, res) => {
    try {
        // Check if both files are uploaded
        if (!req.files || !req.files.targetImage || !req.files.swapImage) {
            return res.status(400).send('Both target image and swap image must be uploaded');
        }

        // Upload images to Cloudinary
        const uploadTargetImage = cloudinary.uploader.upload_stream(
            { public_id: 'target_image' }, 
            (error, result) => {
                if (error) {
                    return res.status(500).send('Error uploading target image to Cloudinary');
                }
                const targetImageUrl = result.secure_url;

                // Upload swap image to Cloudinary
                const uploadSwapImage = cloudinary.uploader.upload_stream(
                    { public_id: 'swap_image' },
                    (error, result) => {
                        if (error) {
                            return res.status(500).send('Error uploading swap image to Cloudinary');
                        }
                        const swapImageUrl = result.secure_url;

                        // Return both image URLs
                        res.status(200).json({
                            message: 'Images uploaded successfully!',
                            targetImageUrl,
                            swapImageUrl
                        });
                    }
                );
                uploadSwapImage.end(req.files.swapImage[0].buffer); // Upload the swap image
            }
        );
        uploadTargetImage.end(req.files.targetImage[0].buffer); // Upload the target image
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).send('Server error');
    }
});

// Serve static files (e.g., HTML page)
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
