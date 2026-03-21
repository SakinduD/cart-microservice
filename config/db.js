const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8002;

if(!MONGODB_URI) {
    throw new Error('MongoDB URI is missing');
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        return mongoose;
    } catch (err) {
        console.error('error connecting to MongoDB:', err.message);
        throw err;
    }
};

module.exports = {
    connectDB,
    mongodbUri: MONGODB_URI,
    port: PORT
};