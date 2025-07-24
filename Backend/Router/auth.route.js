import express from "express";
import {
  logout,
  login,
  getMe,
  register,
  forgotPassword,
  resetPassword,
  verifyOTP,
  updateDetails,
  updateAvatar,
  updatePassword,
} from "../controllers/auth.controllers.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/file.js";

const router = express.Router();

router.get("/logout", logout);
router.get("/", protect, getMe);

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.post("/verify-otp", verifyOTP);

router.put("/resetpassword/:resettoken", resetPassword);

router.patch("/updatedetails", protect, updateDetails);
router.patch("/updateavatar", protect, upload.single("avatar"), updateAvatar);
router.patch("/updatepassword", protect, updatePassword);

export default router;
