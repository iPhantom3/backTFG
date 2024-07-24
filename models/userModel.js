import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    dni: {
        type: String,
        required: true
    },
    profileImageUrl:{
        type:String,
        default: ''
    },
    category: {
        type: [String],
        enum: ['Coche','Moto','Camion']
    },
    affiliateCode: {
        type: String,
        required: true
    },
    friendCode: {
        type: String,
        default: ''
    },
    affiliates: {
        type: Number,
        required: true,
        default: 0,
    },
    isProfessional: {
        type: Boolean,
        required: true,
        default: false
    },
    isFirstBuy: {
        type: Boolean,
        required: true,
        default: true
    },
    termsAccepted:{
        type: Boolean,
        required: true,
        default: false
    },
    privacyAccepted:{
        type: Boolean,
        required: true,
        default: false
    },
    resetToken: {
        type: String,
        default: ''
    },
    resetTokenExpiration: {
        type: Date
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
  
    try {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
      next();
    } catch (error) {
      console.log(error);
    }
  });

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const Users = mongoose.model('Users', userSchema);

export default Users;