import express from 'express';
import {
  createInvoice,
  getAllInvoices,
  getInvoicesByUserId,
  getInvoiceById,
  deleteInvoice,
} from '../controllers/invoiceController.js'

import {protect, professionalProtect} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, professionalProtect, createInvoice)
  .get(protect, professionalProtect, getAllInvoices);
  
router.route('/userinvoices')
  .get(protect, getInvoicesByUserId);

router.route('/:id')
  .get(protect, getInvoiceById)
  .put(protect, deleteInvoice);

export default router;


