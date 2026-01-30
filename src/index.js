import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import connectDB from "./config/dbConfig.js";
import cookieParser from "cookie-parser";
import { languageMiddleware } from "./middlewares/language.middleware.js";
import { loadConfig } from "./config/loadConfig.js";
import redis from "./config/redis.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { t } from "./i18n/index.js";

dotenv.config();
const secret = await loadConfig();
const PORT = secret.PORT || 5000;
await redis.ping();
await connectDB();
const app = express();

app.use(
  cors({
    origin: secret.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/", languageMiddleware, routes);
// health check
app.get("/", (req, res) => {
  res.send("Testing .....");
});
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    data: null,
    message: req.lang ? t(req.lang, "ROUTE_NOT_FOUND") : "Route not found",
  });
});

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Auth Service is running on port ${PORT}`);
});
