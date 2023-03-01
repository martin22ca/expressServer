const { Pool } = require('pg');
const bcrpytjs = require("bcryptjs")
const jwt = require('jsonwebtoken');
const { promisify } = require("util")
const pool = require('../db')
pool.connect();

const Register = async (req, res) => {
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
        catch (error) {
            res.status(403).send({
                'message': 'Not Valid Token'
            })
        }
    }

    try {
        const {username,password, dni, name, lastName, email, telephone } = req.body;
        if (!username || !password || !dni || !name || !lastName) {
            return res.status(400).json({ 'message': 'all fields are required.' });
        }

        const createPersonal = await pool.query("INSERT INTO public.personal_data  (dni,first_name,last_name,1)VALUES ($1, $2, $3,);",
            [dni, name, lastName, email, telephone])

        if (createPersonal.rowCount != 1) {
            return res.status(400).json({ 'message': 'error in database creation.' });
        }

        //CHANGE ROLE ID
        const resposnse = await pool.query("SELECT currval('personal_data_id_seq');")
        const personalId = parseInt(resposnse.rows[0]['currval'])

        let passHas = await bcrpytjs.hash(password, 8)

        const createEmployee = await pool.query("INSERT INTO public.employees (id_personal, id_roll, username, pass_employee) VALUES ($1, $2, $3, $4);",
            [personalId, 1, username, passHas])

        if (createEmployee.rowCount != 1) {
            return res.status(400).json({ 'message': 'error in database creation.' });
        }

        res.sendStatus(200)
    }
    catch (error) {
        console.log(error)
    }
}

const login = async (req, res, next) => {

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 'message': 'Username y password son requeridos.' });
        }
        const foundUser = await pool.query("select * from employees inner join personal_data  on employees.id_personal = personal_data.id  where username = $1", [username], async (error, results) => {
            if (results.rowCount == 0 || !(await bcrpytjs.compare(password, results.rows[0]['pass_employee']))) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Password o username son invalidos"
                });
            }

            else {
                const id = results.rows[0]['id']
                const role = results.rows[0]['id_roll']
                const userNam = results.rows[0]['first_name']
                const userLastName = results.rows[0]['last_name']
                const token = jwt.sign({ id: id }, process.env.TOKEN_SECRET, { expiresIn: '5h' })

                res.status(200).send({
                    userId: id,
                    first_name: userNam,
                    last_name: userLastName,
                    role: role,
                    accessToken: token, // access token
                });
            }

        });
    } catch (error) {
        next(error);
    }
};

const isAuth = async (req, res, next) => {
    try {
        const token = req.query.accesToken;
        if (!token) {
            return res.status(403).json({ 'message': 'No token' });
        }

        const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET)

        if (decoded)
            res.status(200).send({
                'message': 'Valid Token'
            })
        else {
            res.status(403).send({
                'message': 'Not Valid Token'
            })
        }
    }
    catch (error) {
        console.log(error)
        res.sendStatus(404)
    }
}

module.exports = { login, Register, isAuth }
