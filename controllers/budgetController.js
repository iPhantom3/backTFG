import asyncHandler from '../middlewares/asyncHandler.js';
import Budgets from '../models/budgetModel.js';
import Users from '../models/userModel.js';
import Notifications from '../models/notificationModel.js'

// @desc    Create a budget
// @route   POST /api/budgets
// @access  Private
const createBudget = asyncHandler( async(req, res) => {
  const {
    userId, 
    title,
    clientMessage, 
    clientFilesUrl,
    storageFolder
  } = req.body;

  try {
    const formattedTitle = title.trim().charAt(0).toUpperCase() 
      + title.trim().slice(1);
    const formattedClientMessage = clientMessage.trim().charAt(0).toUpperCase() 
      + clientMessage.trim().slice(1);
  
    const budget = await Budgets.create({
        userId,
        title: formattedTitle,
        clientMessage: formattedClientMessage,
        clientFilesUrl,
        storageFolder
    });

    if(budget){
      const clientUser = await Users.findById(budget.userId);
      const professionalUsers = await Users.find({isProfessional: true})

      const userName = clientUser.name.charAt(0).toUpperCase() + clientUser.name.slice(1);

      for(const professionalUser of professionalUsers){
        await Notifications.create({
          userId: professionalUser._id,
          title: 'Nueva solicitud de presupuesto',
          context: `${userName} ha solicitado un presupuesto`,
          type: 'Budget',
          contentId: budget._id
        });
      }

      res.status(201).send(budget);
    } else {
      res.status(500).json({ message: 'Error al crear el presupuesto' })
      throw new Error('Budget creation error');
    }
  } catch (error) {
    console.log(error);
  }
})

// @desc    Get all budgets
// @route   GET /api/invoices
// @access  Private/Professional
const getAllBudgets = asyncHandler( async(req, res) => {
  try{
    const budgets = await Budgets.find({professionalDelete: false})
      .select('-userId -clientFilesUrl -professionalMessage -isAnswered -createdAt -updatedAt');

    if( budgets ){
      res.status(200).send(budgets);

    } else {
      res.status(404).json({ message: 'Presupuestos no encontradas'})
      throw new Error('Budgets not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Get budgets of an user
// @route   GET /api/budgets/userbudgets
// @access  Private
const getUserBudgets = asyncHandler( async(req, res) => {
  try{
    const budgets = await Budgets.find({userId: req.user._id, clientDelete: false})
      .select('-createdAt -updatedAt');

    if( budgets ){
      res.status(200).send(budgets);

    } else {
      res.status(404).json({ message: 'Presupuestos de usuario no encontrados'})
      throw new Error('User budgets not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Get a budget
// @route   GET /api/budgets/:id
// @access  Private
const getBudgetById = asyncHandler( async(req, res) => {

  try{
    const budget = await Budgets.findById(req.params.id, '-createdAt -updatedAt').lean();

    if( budget ){
      res.status(200).send(budget);

    } else {
      res.status(404).json({ message: 'Presupuesto no encontrado'})
      throw new Error('Budget not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Update a budget with professional answer
// @route   PUT /api/budgets/:id
// @access  Private/Professional
const updateProfessionalAnswer = asyncHandler( async(req, res) => {

  const {
    professionalFilesUrl,
    professionalMessage
  } = req.body;

  try{
    const budget = await Budgets.findOneAndUpdate({_id: req.params.id}, {
      'professionalFilesUrl': professionalFilesUrl,
      'professionalMessage': professionalMessage,
      'isAnswered': true
    });

    if( budget ){

      await Notifications.create({
        userId: budget.userId,
        title: 'Mensaje nuevo',
        context: `EuroTaller ha respondido a tu solicitud de presupuesto`,
        type: 'Budget',
        contentId: budget._id
      });

      res.status(200).send(budget);

    } else {
      res.status(404).json({ message: 'Presupuesto no encontrado'})
      throw new Error('Budget not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Soft delete a budget
// @route   POST /api/invoices/:id/deletebudget
// @access  Private
const deleteBudget = asyncHandler( async(req, res) => {
  const {isProfessional} = req.body;
  try{
    const budget = await Budgets.findById({_id: req.params.id})
      .select('-createdAt -updatedAt');

    if( budget ){
      if(isProfessional){
        budget.professionalDelete = true;
      } else {
        budget.clientDelete = true;
      }

      const notifications = await Notifications.find({contentId: budget._id, userId: req.user._id});

      for(let notification of notifications) {
        await Notifications.deleteOne({_id: notification._id})
      }

      await budget.save();

      res.status(200).json({message: 'Presupuesto eliminado'})

    } else {
      res.status(404).json({ message: 'Presupuesto no encontrada'})
      throw new Error('Budget not found');
    }
  } catch( error ) {
    console.log(error)
  }
});


export {
  createBudget,
  getAllBudgets,
  getUserBudgets,
  getBudgetById,
  updateProfessionalAnswer,
  deleteBudget
};