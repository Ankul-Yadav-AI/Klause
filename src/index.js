import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import connectDB from "./config/dbConfig.js";
import cookieParser from "cookie-parser";
import { languageMiddleware } from "./middlewares/language.middleware.js";
import { loadConfig } from "./config/loadConfig.js";

const secret = await loadConfig();

const app = express();

app.use(
  cors({
    origin: secret.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api", languageMiddleware, routes);
dotenv.config();
const PORT = secret.PORT || 5000;
const MONGODB_URI =
  secret.MONGODB_URI || "mongodb://localhost:27017/KlauseUserDB";

await connectDB();

app.listen(PORT, () => {
  console.log(`Auth Service is running on port ${PORT}`);
});
