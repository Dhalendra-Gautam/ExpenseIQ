import express from "express";
import { getDashboardOverview } from "../controllers/dashboardController.js";
import authMiddleware from "../middlewares/auth.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", authMiddleware, getDashboardOverview);

export default dashboardRouter;