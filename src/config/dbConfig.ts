import mongoose from 'mongoose'
import logger from "./logger";


const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI
        if (!mongoURI) {
            throw new Error('MONGO_URI is not defined')
        }
        await mongoose.connect(mongoURI)
        logger.info(`MongoDB connected successfully ${mongoose.connection.host}`);

        // Ensure all indexes are created/synced
        await mongoose.connection.syncIndexes();

    } catch (error) {
        logger.error(`MongoDB connection Failed: ${error}`);
        process.exit(1)
    }
}

export default connectDB
