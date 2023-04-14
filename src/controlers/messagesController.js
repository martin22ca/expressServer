const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { promisify } = require("util")
//netifly

const { checkAuth } = require("../plugins/auth")

const pool = require('../db')
pool.connect();

const getMessages = async (req, res, next) => {
    try {
        const { accessToken, userId } = req.query;

        if (!accessToken) {
            res.status(403).send({
                'message': 'No Token'
            });
            return null
        }
        if (!await checkAuth(accessToken)) {
            res.status(403).send({
                'message': 'Not Valid Token'
            });
            return null
        }
        const foundMessages = await pool.query("SELECT messages.id,title,message,viewd,info FROM messages inner join messages_x_employees on messages.id = messages_x_employees.id_message inner join  employees on messages_x_employees.id_employee = employees.id where employees.id = $1 order by viewd ", 
        [userId], async (error, results) => {
            const messages = results.rows
            res.status(200).send({
                messages
            });
            
        })
        return null


    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Server Error'
        })
    }
}

const changeViewd = async (req, res, next) => {
    try {
        const { accessToken, idMessage } = req.query;

        if (!accessToken) {
            res.status(403).send({
                'message': 'No Token'
            });
            return null
        }
        if (!await checkAuth(accessToken)) {
            res.status(403).send({
                'message': 'Not Valid Token'
            });
            return null
        }
        const foundMessages = await pool.query("update messages set viewd = true where id = $1 ", 
        [idMessage], async (error, results) => {
            (results.rowCount == 1)
            res.status(200).send({
                "message": "message is now viewd"
            });
            
        })
        return null


    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Server Error'
        })
    }
}

const deleteMessage = async (req, res, next) => {
    try {
        const { accessToken, idMessage } = req.query;

        if (!accessToken) {
            res.status(403).send({
                'message': 'No Token'
            });
            return null
        }
        if (!await checkAuth(accessToken)) {
            res.status(403).send({
                'message': 'Not Valid Token'
            });
            return null
        }
        const foundMessages = await pool.query("DELETE FROM messages WHERE id = $1 ", 
        [idMessage], async (error, results) => {
            (results.rowCount == 1)
            res.status(200).send({
                "message": "message is deleted"
            });
            
        })
        return null


    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Server Error'
        })
    }
}

module.exports = { getMessages,changeViewd,deleteMessage}