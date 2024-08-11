import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    prompt: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
