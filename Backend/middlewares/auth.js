import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = 'your_jwt_secret_key';

export default async function authMiddleware(req, res, next) {
    //grab the token
    const authHeader = req.headers.authorization; //when sending a post request the token should come in header named "Authorization" : "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) { //here we check if the token is provided and if it starts with "Bearer "
        return res.status(401).json({
            success: false,
            message: "Not authorized or token missing"
        });
    }
    const token = authHeader.split(" ")[1]; // here we split the token from the space between "Bearer " and the token

    //Verify the token
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select("-password"); //brings user details without the password
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification failed:", error);
        res.status(401).json({
            success: false,
            message: "Token invalid or expired"
        });
    }
};