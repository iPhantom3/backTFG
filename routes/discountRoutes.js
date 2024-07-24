import express from 'express';
import {
  createDiscount,
  getAll,
  getDiscountById,
  disableDiscount
} from '../controllers/discountController.js'

import {protect, professionalProtect} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, professionalProtect, createDiscount)
  .get(protect, professionalProtect, getAll);
  
router.route('/:id')
   .get(protect, professionalProtect, getDiscountById)
   .delete(protect, professionalProtect, disableDiscount);

export default router;

