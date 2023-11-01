import { Router } from "express";
import { createUser, loginUser, getUser } from "../controllers/userController";
import { passportConfig } from "../config/passport-config";

const router = Router();

// GET - Fetch user details
router.get("/user", passportConfig.authenticate, getUser);

// POST - Register a user
router.post("/register", createUser);

// POST - Login a user
router.post("/login", loginUser);

export default router;
