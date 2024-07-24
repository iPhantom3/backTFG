import asyncHandler from '../middlewares/asyncHandler.js';
import Notifications from '../models/notificationModel.js'


// @desc    Get notifications of an user
// @route   GET /api/notifications/
// @access  Private
const getNotificationsByUserId = asyncHandler( async(req, res) => {

  try{
    const notifications = await Notifications.find({userId: req.user._id})
      .select('-createdAt -updatedAt');

    if( notifications ){
      res.status(200).send(notifications);
    } else {
      res.status(404).json({ message: 'Notificaciones de usuario no encontrada'})
      throw new Error('User notifications not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Get not read notifications
// @route   GET /api/notifications/arenotifications
// @access  Private
const getAreNotifications = asyncHandler( async(req, res) => {

  try{
    const notifications = await Notifications.find({userId: req.user._id, isRead: false})
      .count();
      
    if(notifications > 0){
      res.status(200).send({areNotifications: true});
    } else if(notifications === 0){
      res.status(200).send({areNotifications: false});
    } else{
      res.status(500).json({ message: 'Ha habido un problema'})
      throw new Error('User notifications not found');
    }
  } catch( error ) {
    console.log(error)
  }
});


// @desc    Update read Notification
// @route   PUT /api/notifications/:id
// @access  Private
const updateReadNotification = asyncHandler( async(req, res) => {

  try{
    const notification = await Notifications
      .findById(req.params.id)
      .select('-createdAt -updatedAt');

    if( notification ){
      notification.isRead = true;

      await notification.save();

      res.status(200).send(notification);
    } else {
        res.status(404).json({ message: 'Notificacion no encontrada'})
        throw new Error('Notification not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

// @desc    Delete a Notification
// @route   Delete /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler( async(req, res) => {

  try{
    const notification = await Notifications
      .findById(req.params.id)

      if( notification ){
        
        if(!notification.userId.equals(req.user._id)){
          return res.status(400).json({ message: 'Error al eliminar.' })
        }

        await Notifications.deleteOne({_id: notification._id})

      res.status(200).json({ message: 'Notificacion eliminada'});
    } else {
        res.status(404).json({ message: 'Notificacion no encontrada'})
        throw new Error('Notification not found');
    }
  } catch( error ) {
    console.log(error)
  }
});

export {
  getNotificationsByUserId,
  getAreNotifications,
  updateReadNotification,
  deleteNotification
};  