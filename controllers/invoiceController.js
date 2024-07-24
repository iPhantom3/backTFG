import asyncHandler from '../middlewares/asyncHandler.js';
import Invoices from '../models/invoiceModel.js';
import Users from '../models/userModel.js';
import Notifications from '../models/notificationModel.js'

// @desc    Create an invoice
// @route   POST /api/invoices
// @access  Private/Profesional
const createInvoice = asyncHandler( async(req, res) => {
  const {
    userId, 
    invoiceNumber,
    cost, 
    invoiceDate, 
    paymentMethod
  } = req.body;

  try {
    const user = await Users.findById(userId);

    if( user ) {
      const invoice = await Invoices.create({
        userId,
        invoiceNumber,
        cost: Number(cost.replace(',' , '.')).toFixed(2),
        invoiceDate,
        paymentMethod: paymentMethod.trim(),
      });

      if(invoice){

        const notification = await Notifications.create({
          userId,
          title: 'Nueva Factura',
          context: 'EuroTaller ha añadido una nueva factura a tu perfil',
          type: 'Invoice',
          contentId: invoice._id
        });

        if(user.isFirstBuy && user.friendCode !== '') {
          const friend = await Users.findOneAndUpdate(
            {affiliateCode: user.friendCode}, 
            {$inc: {'affiliates': 1}});
          if (friend){
          }

          user.isFirstBuy = false;
          await user.save();
        }

        res.status(201).send(invoice);
      
      } else {
        res.status(500).json({ message: 'Error al crear la factura' })
      }

    } else {
      res.status(500).json({ message: 'Error al crear la factura' })
      throw new Error('Invoice creation error');
    }
  } catch (error) {
    console.log(error);
  }
})

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private/Professional
const getAllInvoices = asyncHandler( async(req, res) => {
  try{
    const invoices = await Invoices.find({professionalDelete: false})
      .select('-createdAt -updatedAt');;

    if( invoices ){
      res.status(200).send(invoices);

    } else {
      res.status(404).json({ message: 'Facturas no encontradas'})
      throw new Error('Invoices not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Get invoices of an user
// @route   GET /api/invoices/userinvoice
// @access  Private
const getInvoicesByUserId = asyncHandler( async(req, res) => {
  try{
    const invoices = await Invoices.find({userId: req.user._id, clientDelete: false})
      .select('-createdAt -updatedAt');

    if( invoices ){
      res.status(200).send(invoices);

    } else {
      res.status(404).json({ message: 'Facturas de usuario no encontrada'})
      throw new Error('User invoices not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Get an invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = asyncHandler( async(req, res) => {
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  try{
    const invoice = await Invoices.findById(req.params.id, '-createdAt -updatedAt').lean();

    if( invoice ){

      const user = await Users.findById(invoice.userId);

      invoice.userName = user.name

      const formattedDate = invoice.invoiceDate.toLocaleDateString('es-ES',dateOptions);
      invoice.invoiceDate = formattedDate;

      res.status(200).send(invoice);

    } else {
      res.status(404).json({ message: 'Factura no encontrada'})
      throw new Error('Invoice not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Soft delete an invoices
// @route   PUT /api/invoices/:id
// @access  Private
const deleteInvoice = asyncHandler( async(req, res) => {
  const {isProfessional} = req.body;
  try{
    const invoice = await Invoices.findById({_id: req.params.id})
      .select('-createdAt -updatedAt');

    if( invoice ){
      if(isProfessional){
        invoice.professionalDelete = true;
      } else {
        invoice.clientDelete = true;

        const notifications = await Notifications.find({contentId: invoice._id});

        for(let notification of notifications) {
          await Notifications.deleteOne({_id: notification._id})
        }
      }

      await invoice.save();

      res.status(200).json({message: 'Factura eliminada'})

    } else {
      res.status(404).json({ message: 'Facturas de usuario no encontrada'})
      throw new Error('User invoices not found');
    }
  } catch( error ) {
    console.log(error)
  }
});


export {
  createInvoice,
  getAllInvoices,
  getInvoicesByUserId,
  getInvoiceById,
  deleteInvoice
};