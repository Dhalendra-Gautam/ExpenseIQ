import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import userRouter from "./routes/userRoute.js";
import incomeRouter from "./routes/incomeRoute.js";
import expenseRouter from "./routes/expenseRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import aiRouter from "./routes/aiRoute.js";

const app = express();
const port = process.env.PORT || 4000;

//MIDDLEWARES
app.use(cors({
    origin: ["http://localhost:5173",
        "https://expense-iq-seven.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//DB
connectDB();

//ROUTES
app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/ai", aiRouter); // New Route for AI Insights

app.get('/', (req, res) => {
    res.send("API Working");
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})