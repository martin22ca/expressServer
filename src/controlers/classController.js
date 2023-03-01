const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { promisify } = require("util")
//netifly

const pool = require('../db')
pool.connect();


const getClasses = async(req, res) =>{
    const token = req.body.token;
    if (!token) {
        return res.status(400).json({ 'message': 'No token' });
    }
    else {
        try {
            const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET)
            if (!decoded)
                res.status(403).send({
                    'message': 'Not Valid Token'
                })
        }
        catch (error){
            res.status(403).send({
                'message': 'Not Valid Token'
            })
        }
    }

    try{
        const token = req.query.accesToken;
        if (!token) {
            return res.status(400).json({ 'message': 'No token' });
        }

        const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET)

        if (!decoded){
            res.status(403).send({
                'message': 'Not Valid Token'
            })
        }
        const role = req.query.role
        if(!req){
            return res.status(400).json({ 'message': 'No role error' });
        }
        else{
            classes = await pool.query("select * from classes ")
            res.status(200).send(
                classes.rows
            )
        }
    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Not Valid Token'
        })
    }
}

module.exports = {getClasses}