import { Router } from "express";
import userRoutes from "./userRoutes";
import communityRoutes from "./communityRoutes";
import eventRoutes from "./eventRoutes";
import chatRoutes from "./chatRoutes";
import messageRoutes from "./messageRoutes";

const router = Router();

// Include chat routes
router.use("/chat", chatRoutes);

// Include community routes
router.use("/communities", communityRoutes);

// Include event routes
router.use("/events", eventRoutes);

// Include message routes
router.use("/message", messageRoutes);

// Include user routes
router.use("/users", userRoutes);

export default router;
