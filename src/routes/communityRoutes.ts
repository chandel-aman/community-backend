import express from "express";
import {
  createCommunity,
  deleteCommunity,
  listCommunities,
  joinCommunity,
} from "../controllers/communityController";
import { passportConfig } from "../config/passport-config";

const router = express.Router();

// GET
router.get("/", listCommunities);

// POST
router.post("/create", passportConfig.authenticate, createCommunity);

router.post("/join/:id", passportConfig.authenticate, joinCommunity);

// DELETE
router.delete("/delete/:id", deleteCommunity);

export default router;
