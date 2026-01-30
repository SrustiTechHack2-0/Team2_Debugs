import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    type:{
        type: String,
        enum: ["TAILGATING", "UNAUTHORIZED"],
        required: true
    }, 

    gateId: String,
    current: Number,
    allowed: Number,

    timestamp: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        enum: ["new", "acknowledged", "resolved"],
        default: "new"
    }
});

export const Alert = mongoose.model("Alert", alertSchema);