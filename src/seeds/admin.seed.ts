import connectDB from "../config/dbConfig"
import { User } from "../models/user"
import { hashPassword } from "../utils/password"
import dotenv from 'dotenv'

dotenv.config()

const createAdmin = async () => {
    try {
        await connectDB()

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' })
        if (existingAdmin) {
            console.log('Admin already exists')
            return
        }

        if (!adminEmail || !adminPassword) {
            console.error('Admin email or password is not defined')
            return
        }

        const hashedPassword = await hashPassword(adminPassword)

        await User.create({
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
        });
        
        console.log('Admin created successfully')
        
    } catch (error) {
        console.error('Error creating admin:', error)
    } finally {
        process.exit(0)
    }
}

createAdmin()