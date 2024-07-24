import express from "express";
const router = express.Router();

import { 
  getNotificationsByUserId,
  getAreNotifications,
  updateReadNotification,
  deleteNotification
 } from "../controllers/notificationController.js";

import {protect} from '../middlewares/authMiddleware.js';

router.route('/').get(protect, getNotificationsByUserId);

router.route('/:id')
   .put(protect, updateReadNotification)
   .delete(protect, deleteNotification);

router.route('/areNotifications').get(protect, getAreNotifications)

export default router;