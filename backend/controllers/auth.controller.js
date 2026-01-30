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

    } catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
    const { authId } = req.body;

    const auth = await userAuth.findOne({ authId, status: "active"});

    if (!auth){
        return res.status(404).json({

        })
    };
}