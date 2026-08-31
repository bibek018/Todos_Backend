import express from "express";
import { getMyProfile, updateMyProfile, deleteUser ,changePassword} from "../controllers/controller.users.js";
import {authorize} from "../middlwares/authorize.js";
import { upload } from "../middlwares/upload.js";
import {changePasswordSchema, updateProfileSchema} from "../validators/user.validator.js";
import {validate} from "../middlwares/validate.js"
const router = express.Router();

router.get("/me", getMyProfile);
router.put("/me", upload.single("avatar"), validate(updateProfileSchema),updateMyProfile);
router.delete("/:id", authorize('admin'), deleteUser);
router.put("/me/changepassword", validate(changePasswordSchema),changePassword);
export default router;
