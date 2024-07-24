import express from 'express';
import {
  createOffer,
  getAllByCategory,
  getOfferById,
  getAllInactiveOffers,
  getAllUserOfferByCategory,
  deactivateOffer
} from '../controllers/offerController.js'

import {protect, professionalProtect} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, professionalProtect, createOffer )
  .get(getAllByCategory);

router.route('/inactive')
  .get(protect, professionalProtect, getAllInactiveOffers);

router.route('/useroffers')
  .get(protect, getAllUserOfferByCategory);

router.route('/:id')
  .get(protect, getOfferById)
  .put(protect, professionalProtect, createOffer);

router.route('/:id/inactive')
  .put(protect, professionalProtect, deactivateOffer);

export default router;


