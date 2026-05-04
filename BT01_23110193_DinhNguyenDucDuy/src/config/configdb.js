import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const options = {
            // Đã xóa useNewUrlParser và useUnifiedTopology
            minPoolSize: 1,
            maxPoolSize: 50,
        };
        await mongoose.connect(`${process.env.DATABASE_URL}`, options);
        console.log('MongoDB connected!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

module.exports = connectDB;