import asyncHandler from '../middlewares/asyncHandler.js';
import Discounts from '../models/discountModel.js';

// @desc    Create a discount
// @route   POST /api/discounts
// @access  Private/Profesional
const createDiscount = asyncHandler( async(req, res) => {
  const { 
    title,
    percent, 
    accounts} = req.body;

  let formattedPercent = '';

    if(percent.includes('%')){
    formattedPercent = percent.trim();
    } else {
      formattedPercent = percent.trim() + '%';
    }
  
  try {

    const discount = await Discounts.create({
        title,
        percent: formattedPercent,
        accounts
    });

    if(discount){
      res.status(201).send(discount);
    } else {
      res.status(500).json({ message: 'Error al crear el descuento' })
      throw new Error('Creation error');
    }

  } catch (error) {
    console.log(error);
  }
})

// @desc    Get all discounts
// @route   GET /api/discounts
// @access  Private/Professional
const getAll = asyncHandler( async(req, res) => {
  try{
    const discounts = await Discounts.find({isActive: true})
      .select('-createdAt -updatedAt');;

    if( discounts ){
      res.status(200).send(discounts);
    } else {
      res.status(404).json({ message: 'Descuentos no encontradas'})
      throw new Error('Discounts not found');
    }

  } catch( error ) {
    console.log(error)
  }
});

// @desc    Get a discount
// @route   GET /api/discounts/:id
// @access  Private/Professional
const getDiscountById = asyncHandler( async(req, res) => {
  try{
    const discount = await Discounts.findById(req.params.id, '-isActive -createdAt -updatedAt');

    if( discount ){
      res.status(200).send(discount);

    } else {
      res.status(404).json({ message: 'Descuento no encontrado'})
      throw new Error('Discount not found');
    }

  } catch( error ) {
    console.log(error)
  }
});

// @desc    Disable a discount
// @route   Delete /api/discounts/:id
// @access  Private/Professional
const disableDiscount = asyncHandler( async(req, res) => {
  try{
    const discount = await Discounts.findById(req.params.id, '-createdAt -updatedAt');

    if( discount ){
      discount.isActive = false;
      discount.save();

      res.status(200).json({message: 'Descuento eliminado.'});

    } else {
      res.status(404).json({ message: 'Descuento no encontrado'})
      throw new Error('Discount not found');
    }

  } catch( error ) {
    console.log(error)
  }
});


export {
  createDiscount,
  getAll,
  getDiscountById,
  disableDiscount
};