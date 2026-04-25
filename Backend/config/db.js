import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://dhalendragautam09_db_user:r8vFseTqxnWHGgY2@cluster0.xck3cke.mongodb.net/")
        .then(() => console.log("Database connected"));
}