import Address from "../models/address.js";
import { JSDOM } from 'jsdom';
import dompurify from 'dompurify';

const { window } = new JSDOM('<!DOCTYPE html>');
const DOMPurify = dompurify(window);

// add address : /api/address/add
export const addAddress = async(req,res)=>{
    try {
        const {address,userId} = req.body;
        const purifiedAddress = JSON.parse(DOMPurify.sanitize(JSON.stringify(address)));
        if(!purifiedAddress.firstName || !purifiedAddress.phone || !purifiedAddress.country || !purifiedAddress.zipcode || !purifiedAddress.state || !purifiedAddress.city || !purifiedAddress.street || !purifiedAddress.email || !purifiedAddress.lastName){
            return res.json({success: false, message: "Enter valid address details"})
        }
        await Address.create({...purifiedAddress,userId})
        res.json({success: true, message: "Address added successfully"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message});
    }
}

// get address : /api/address/get
export const getAddress = async(req,res)=>{
    try {
        const {userId} = req.body;
        const addresses = await Address.find({userId});
        res.json({success: true, addresses})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message});
    }
}