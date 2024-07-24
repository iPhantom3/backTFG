import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    title: {
        type: String,
        required: true
    },
    context: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Offer','Invoice','Budget'],
        required: true
    },
    contentId: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        required: true,
        default: false
    },
}, {
    timestamps: true
});

const Notifications = mongoose.model('Notifications', notificationSchema);

export default Notifications;