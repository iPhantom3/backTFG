import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    additionalInfo: {
        type: String,
        required: true
    },
    category: {
        type: [String],
        enum: ['Coche', 'Moto', 'Camion'],
        required: true,
    },
    validityDt: {
        type: Date,
        default: Date.now()
    },
    isActive:{
        type: Boolean,
        required: true,
        default: true
    },
    imageUrl: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const Offers = mongoose.model('Offers', offerSchema);

export default Offers;