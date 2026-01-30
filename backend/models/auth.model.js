import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    authId: {
        type: String,
        required: true,
        unique: true
    },

    allowedPersons: {
        type: Number,
        required: [false, 'If not provided then default is 1'],
        default: 1
    },

    gateId: {
        type: String,
        required: true
    },

    timeWindow: {
        type: Number,
        default: 30
    },

    status: {
        type: String,
        enum: ["active", "used"],
        default: "active"
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60*60*24
    }
});

export const userAuth =  mongoose.model("userAuth", userSchema);