import { Router } from "express";
import userRoutes from "./users/index.js";
import adminRoutes from "./admin/index.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/admin",adminRoutes);

export default router;
