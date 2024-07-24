import asyncHandler from '../middlewares/asyncHandler.js';
import Offers from '../models/offerModel.js';
import Notifications from '../models/notificationModel.js';
import Users from '../models/userModel.js';

// @desc    Create a offer
// @route   POST /api/offers
// @access  Private/Profesional
const createOffer = asyncHandler( async(req, res) => {
  const {title, 
    description, 
    additionalInfo, 
    category, 
    validityDt, 
    imageUrl} = req.body;
  
  try {
    const offer = await Offers.create({
        title,
        description,
        additionalInfo,
        category,
        validityDt,
        imageUrl,
    });

    if(offer){
      const users = await Users.find({category: {$in: offer.category}})

      for(const user of users){

        const notification = await Notifications.create({
          userId: user._id,
          title: offer.title,
          context: offer.description,
          type: 'Offer',
          contentId: offer._id
        });
      }

      res.status(201).send(offer);

    } else {
      res.status(400).json({ message: 'Datos introducidos erroneos.' })
      throw new Error('Wrong data');
    }
  } catch (error) {
    console.log(error);
  }
});

// @desc    Get all offers filter by category
// @route   GET /api/offers
// @access  Private
const getAllByCategory = asyncHandler( async(req, res) => {
  try{
    const offers = await Offers.find({isActive: true})
    .select('-validityDt -isActive -createdAt -updatedAt -additionalInfo');

    if( offers ){
      const cocheCategory = offers.filter(offer => offer.category.includes('Coche'));
      const motoCategory = offers.filter(offer => offer.category.includes('Moto'));
      const camionCategory = offers.filter(offer => offer.category.includes('Camion'));
      const offersByCategories = [
        { 
          'name': 'Ofertas para coches',
          'offers': [...cocheCategory]
        },
        {
          'name': 'Ofertas para motos',
          'offers': [...motoCategory]},
        {
          'name': 'Ofertas para camiones',
          'offers': [...camionCategory]
        }
      ]

      res.status(200).send(offersByCategories);

    } else {
      res.status(404).json({ message: 'Ofertas no encontradas'})
      throw new Error('Offers not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Get all user offers filter by category
// @route   GET /api/offers/useroffer
// @access  Private
const getAllUserOfferByCategory = asyncHandler( async(req, res) => {
  try{

    const user = await Users.findById(req.user._id).select('category');

    const offers = await Offers.find({isActive: true, category: {$in: user.category}})
      .select('-validityDt -isActive -createdAt -updatedAt -additionalInfo');

    if( offers ){

      let userOffersByCategory = [];

      for(let userCategory of user.category){
        const offersInCategory = offers.filter(offer => offer.category.includes(userCategory));
        const category = (userCategory === 'Coche') ? 
          'coches' 
        : (userCategory === 'Moto') ? 
          'motos'
        : 'camiones';

        userOffersByCategory.push({
          'name': `Ofertas para ${category}`,
          'offers': [...offersInCategory]
        });
      }

      res.status(200).send(userOffersByCategory);
    
    } else {
      res.status(404).json({ message: 'Ofertas no encontradas'})
      throw new Error('Offers not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Get all offers filter by category
// @route   GET /api/offers/inactive
// @access  Private/professional
const getAllInactiveOffers= asyncHandler( async(req, res) => {
  try{
    const offers = await Offers.find({isActive: false})
    .sort({updatedAt: 'desc'})
    .select('-validityDt -isActive -createdAt -additionalInfo');

    if( offers ){
      res.status(200).send(offers);

    } else {
      res.status(404).json({ message: 'Ofertas no encontradas'})
      throw new Error('Offers not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Get a offer
// @route   GET /api/offers/:id
// @access  Private
const getOfferById = asyncHandler( async(req, res) => {
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  try{
    const offer = await Offers.findById(req.params.id, '-createdAt -updatedAt').lean();

    if( offer ){

      const formattedDate = offer.validityDt.toLocaleDateString('es-ES',dateOptions);
      offer.validityDt = formattedDate;

      res.status(200).send(offer);

    } else {
      res.status(404).json({ message: 'Oferta no encontrada'})
      throw new Error('Offer not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Deactivate an offer
// @route   PUT /api/offers/:id
// @access  Private/Professional
const deactivateOffer = asyncHandler( async(req, res) => {
  
  try{
    const offer = await Offers.findOneAndUpdate({_id: req.params.id}, {
      'isActive': false
    });

    if( offer ){

      const notifications = await Notifications.find({contentId: offer._id});

      for(let notification of notifications) {
        await Notifications.deleteOne({_id: notification._id})
      }

      res.status(200).send(offer);

    } else {
      res.status(404).json({ message: 'Oferta no encontrada'})
      throw new Error('Offer not found');
    }
  } catch( error ) {
    console.log(error)
  }
});


export {
  createOffer,
  getAllByCategory,
  getOfferById,
  getAllInactiveOffers,
  getAllUserOfferByCategory,
  deactivateOffer
};