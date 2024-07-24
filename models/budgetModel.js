import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    type: {
        type: String,
        require: true
    },
    fileUrl: {
        type: String,
        require: true
    }
});

const documentSchema = new mongoose.Schema({
    fileName: {
        type: String,
        require: true
    },
    fileUrl: {
        type: String,
        require: true
    }
});

const budgetSchema = new mongoose.Schema({
    userId: {  
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Users'
    },
    title:{
        type: String,
        required:true
    },
    clientMessage: {
        type: String,
        required: true
    },
    professionalMessage: {
        type: String,
    },
    storageFolder:{
        type: String
    },
    clientFilesUrl: {
        type: Array,
        of: fileSchema
    },
    professionalFilesUrl: {
        type: Array,
        of: documentSchema
    },
    isAnswered: {
        type: Boolean,
        required: true,
        default: false,
    },
    clientDelete: {
        type: Boolean,
        default: false
    },
    professionalDelete: {
        type: Boolean,
        default: false
    },
});

const Budgets = mongoose.model("Budgets", budgetSchema);

export default Budgets;
