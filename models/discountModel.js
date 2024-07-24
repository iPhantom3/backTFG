import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    percent: {
        type: String,
        required: true
    },
    accounts:{
        type: Number,
        required: true
    },
    isActive:{
        type: Boolean,
        required: true,
        default: true
    },
}, {
    timestamps: true
});

const Discounts = mongoose.model('Discounts', discountSchema);

export default Discounts;