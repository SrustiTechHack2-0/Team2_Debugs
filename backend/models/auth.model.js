import mongoose from "mongoose";

constuserSchema = new mongoose.Schema({
    authId: {
        type: String,
        required: true,
        unique: true
    },

    allowedPersons: {
        type: Number,
        required: [false, 'If not provided default is set to 1'],
        default: 1
    },

    gateId: {
        type: String,
        required: [false, 'If not provided default is set to GATE_1'],
        default: "GATE_1"
    },

    timeWindow: {
        type: Number,
        required: [false, 'If not provided default is set to 30s'],
        default: 30
    },

    status: {
        type: String,
        enum: ["active", "used"],
        default: "actve"
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60*60*24
    }
});

export const userAuth = mongoose.model("userAuth", userSchema);