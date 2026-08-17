import express from "express";
import { authorize } from "../middlwares/authorize.js";
import { getUsers } from "../controllers/controller.admin.js";
const router = express.Router();
router.get("/users", authorize("admin"), getUsers);
export default router;