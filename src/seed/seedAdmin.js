import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "../models/admin/admin.model.js";
import connectDB from "../config/dbConfig.js";
import { loadConfig } from "../config/loadConfig.js";


const config = await loadConfig();

const adminSeed = async () => {
    try {
        
        await connectDB();

        const email = "admin.viamenu@yopmail.com";
        const password = "Admin@12345";
        const hashed = await bcrypt.hash(password, 10);

        const existing = await Admin.findOne({ email });
        if (!existing) {
            await Admin.create({ email, password: hashed });
            console.log("✅ Admin seeded successfully");
        } else {
            console.log("⚡ Admin already exists");
        }
    } catch (err) {
        console.error("❌ Error in seeding admin:", err.message);
    } finally {
        mongoose.connection.close();
    }
}

adminSeed();