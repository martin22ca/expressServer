const { Pool } = require('pg');
const bcrpytjs = require("bcryptjs")
const jwt = require('jsonwebtoken');
const { promisify } = require("util")
const pool = require('../db')
pool.connect();

const Register = async (req, res) => {
    try {
        const { firstName, lastName, dni, username, password, email, role } = req.body;
        var query = "INSERT INTO personal_data (first_name,last_name ,dni,email) VALUES ($1, $2, $3,$4) RETURNING ID"
        var eleme = [firstName, lastName, dni, email]

        if (email == null) {
            var query = "INSERT INTO personal_data (first_name,last_name ,dni) VALUES ($1, $2, $3) RETURNING ID"
            var eleme = [firstName, lastName, dni]
        }

        const createPersonal = await pool.query(query, eleme)
        const personalId = createPersonal.rows[0]['id']

        let passHas = await bcrpytjs.hash(password, 8)

        const createEmployee = await pool.query("INSERT INTO employees (id_personal_data,id_role,user_name,user_pass) VALUES ($1, $2, $3, $4)",
            [personalId, role, username, passHas])

    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database creation.' });
    }

    res.sendStatus(200)
}

const login = async (req, res, next) => {

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 'message': 'Username y password son requeridos.' });
        }
        const foundUser = await pool.query("SELECT employees.id,id_role,personal_data.first_name ,personal_data.last_name,user_pass,personal_data.email FROM employees INNER JOIN personal_data ON employees.id_personal_data = personal_data.id  WHERE user_name = $1", [username], async (error, results) => {
            if (results.rowCount == 0 || !(await bcrpytjs.compare(password, results.rows[0]['user_pass']))) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Password y/o Username son invalidos"
                });
            }

            else {
                const id = results.rows[0]['id']
                const role = results.rows[0]['id_role']
                const userNam = results.rows[0]['first_name']
                const userLastName = results.rows[0]['last_name']
                const email = results.rows[0]['email']
                const token = jwt.sign({ id: id }, process.env.TOKEN_SECRET, { expiresIn: '5h' })

                res.status(200).send({
                    userId: id,
                    first_name: userNam,
                    last_name: userLastName,
                    role: role,
                    email: email,
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
        const token = req.query.accessToken;
        if (!token) {
            return res.status(403).json({ 'message': 'No token' });
        }
        
        const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET)

        if (decoded)
            res.status(200).send({
                'message': 'Valid Token'
            })
        else {
            res.status(400).send({
                'message': 'Not Valid Token'
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Token not Valid' 
        })
    }
}

module.exports = { login, Register, isAuth }
