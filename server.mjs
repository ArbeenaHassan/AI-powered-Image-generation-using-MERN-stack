import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Image from './Image.js';

const __dirname = path.resolve();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1";
const HF_API_KEY = "Bearer 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"; // Update with your actual API key

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/imageDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate', async (req, res) => {
    const { inputs } = req.body;

    try {
        const response = await fetch(HF_API_URL, {
            headers: {
                Authorization: HF_API_KEY,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ inputs }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.blob();
        const buffer = Buffer.from(await result.arrayBuffer());

        const imageName = `image-${Date.now()}.png`;
        const imagePath = path.join(__dirname, 'images', imageName);

        fs.writeFileSync(imagePath, buffer);

        const imageUrl = `http://localhost:5000/images/${imageName}`;

        // Save image URL to MongoDB
        const newImage = new Image({ url: imageUrl, prompt: inputs });
        await newImage.save();

        res.json({ imageUrl });
        console.log('Image generated:', imageUrl);
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send('Error generating image');
    }
});

app.use('/images', express.static(path.join(__dirname, 'images')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
