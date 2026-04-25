import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import userRouter from "./routes/userRoute.js";

const app = express();
const port = 4000;

//MIDDLEWARES
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//DB
connectDB();

//ROUTES
app.use("/api/user", userRouter);

app.get('/', (req, res) => {
    res.send("API Working");
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)
})