import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./utils/logger";
import userRouter from "./routes/userRouter";
import adminRouter from "./routes/adminRouter";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(helmet());


const allowedOrigins = [
    "http://localhost:3000",
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


if (process.env.NODE_ENV === "development") {
    app.use(
        morgan("dev", {
            stream: {
                write: (message: string) => logger.http(message.trim()),
            },
        })
    );
}


app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Sking Cosmetics API is healthy 🚀"
    });
});



app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);

import { errorHandler } from "./middlewares/error.middleware";
// Force restart
app.use(errorHandler);

export default app;
