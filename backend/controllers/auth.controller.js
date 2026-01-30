import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';

import { userAuth } from '../models/auth.model';

export const create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try{

        const { allowedPersons, gateId, timeWindow } = req.body;

        const authId = crypto.randomUUID();

        const auth = await userAuth.create({
            authId,
            allowedPersons,
            gateId,
            timeWindow
        });

        res.status(200).json({
            success: true,
            authId: auth.authId,
            allowedPersons,
            gateId,
            timeWindow
        })
        
    } catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const validate = async (req, res) => {

    try{
        const { authId } = req.body;

        const auth = await userAuth.findOne({ authId, status: "active"});

        if (!auth){
            return res.status(404).json({
                success: false,
                message: "Invalid auth"
            });
        }

        console.log("Auth Object from DB: ", auth);

        console.log("Sending data to AI: ", {
            allowedPersons: auth.allowedPersons,
            gateId: auth.gateId,
            timeWindow: auth.timeWindow
        });

        await axios.post("http://localhost:8000/ai/instruction", {
            allowedPersons: auth.allowedPersons,
            gateId: auth.gateId,
            timeWindow: auth.timeWindow
        },
        {
            headers: {
                "Content-Type": "application/json"
            }
        });

        auth.status = "used";

        await userAuth.deleteOne({ authId });

        res.json({
            success: true,
            message: "Auth Validate and sent to AI"
        });

    } catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
    
}