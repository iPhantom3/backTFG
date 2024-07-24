import express from 'express';
import {
  createBudget,
  deleteBudget,
  getAllBudgets,
  getBudgetById,
  getUserBudgets,
  updateProfessionalAnswer
} from '../controllers/budgetController.js'

import {protect, professionalProtect} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBudget)
  .get(protect, professionalProtect, getAllBudgets);
  
router.route('/userbudgets')
   .get(protect, getUserBudgets);

router.route('/:id')
  .get(protect, getBudgetById)
  .put(protect, professionalProtect, updateProfessionalAnswer);

router.route('/:id/deletebudget').post(protect, deleteBudget)

export default router;



