import express from "express";
import {
  signInUser,
  registerUser,
  logoutUser,
  getProfile,
  getUsersList,
  updateUser,
  getUserInvitations,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

import { protect, professionalProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route('/').post(registerUser).get(protect, professionalProtect, getUsersList);
router.post('/signin', signInUser);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);

router.route('/profile').get(protect, getProfile).put(protect, updateUser);

router.route("/invitation").get(protect, getUserInvitations);

export default router;
