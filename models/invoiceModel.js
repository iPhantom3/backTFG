import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    userId: {  
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Users'
    },
    cost: {
        type: Number,
        required: true
    },
    invoiceDate: {
        type: Date,
        required: true
    },
    paymentMethod:{
        type: String,
        required: true
    },
    invoiceNumber:{
        type: String,
        required: true
    },
    clientDelete: {
        type: Boolean,
        default: false
    },
    professionalDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Invoices = mongoose.model('Invoices', invoiceSchema);

export default Invoices;