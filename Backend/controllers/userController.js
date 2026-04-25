import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = 'your_jwt_secret_key';
const TOKEN_EXPIRY = '24h';

const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

//REGISTER A USER
export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email"
        })
    }
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long"
        });
    }

    try {
        if (await User.findOne({ email })) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
            const hashed = await bcrypt.hash(password, 10); //hashing password using bcrypt
            const user = await User.create({
                name,
                email,
                password: hashed
            });
            const token = createToken(user._id); //MongoDB generates an id for each user(unique) using it to create token

            res.status(201).json({
                success: true,
                token, user: { id: user._id, name: user.name, email: user.email }
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

//LOGIN USER
export async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const token = createToken(user._id);
        res.status(200).json({
            success: true,
            token, user: { id: user._id, name: user.name, email: user.email }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

//GET LOGIN USER DETAILS
export async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user.id).select("name email");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.json({ success: true, user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

//UPDATE USER PROFILE
export async function updateProfile(req, res) {
    const { name, email } = req.body;
    if (!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Valid email and name are required"
        });
    }
    try {
        const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true, select: "name email" }
        );
        res.json({
            success: true,
            user
        })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

// CHANGE USER PASSWORD
export async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "password invalid or too short"
        });
    }
    try {
        const user = await User.findById(req.user.id).select("password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid current password"
            });
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();
        res.json({
            success: true,
            message: "Password changed successfully"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}