const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const { checkAuth } = require("../plugins/auth")

const pool = require('../db')
pool.connect();


const getClasses = async (req, res) => {
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
        const foundClasses = await pool.query("SELECT id,school_year ,school_section FROM student_class WHERE id_employee = $1 ORDER BY school_year DESC",
            [userId], async (error, results) => {
                const schoolClasses = results.rows
                res.status(200).send({
                    schoolClasses
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

const viewClass = async (req, res) => {
    try {
        const { accessToken, userId, } = req.query;

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
        const foundClasses = await pool.query("SELECT id,school_year ,school_section FROM student_class WHERE id_employee = $1 ORDER BY school_year DESC",
            [userId], async (error, results) => {
                const schoolClasses = results.rows
                res.status(200).send({
                    schoolClasses
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

module.exports = { getClasses }