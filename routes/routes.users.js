import express from "express";
import { getMyProfile, updateMyProfile, deleteUser } from "../controllers/controller.users.js";
import {authorize} from "../middlwares/authorize.js";
import { upload } from "../middlwares/upload.js";
const router = express.Router();

router.get("/me", getMyProfile);
router.put("/me", upload.single("avatar"), updateMyProfile);
router.delete("/:id", authorize('admin'), deleteUser);
export default router;
