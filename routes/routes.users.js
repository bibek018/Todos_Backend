import express from "express";
import { getMyProfile, updateMyProfile, deleteUser } from "../controllers/controller.users.js";
import {authorize} from "../middlwares/authorize.js";
const router = express.Router();

router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.delete("/:id", authorize('admin'), deleteUser);
export default router;
