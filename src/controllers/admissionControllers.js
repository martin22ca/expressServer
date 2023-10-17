const bcrpytjs = require("bcryptjs")
const jwt = require('jsonwebtoken');
const { promisify } = require("util")
const pool = require('../db')
pool.connect();

const login = async (req, res, next) => {

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 'message': 'Username y password son requeridos.' });
        }
        const foundUser = await pool.query("SELECT u.id,u.id_role,u.user_name,u.user_password, u.active, pd.first_name,pd.last_name,pd.email  from users u inner join personal_data pd ON u.id_personal = pd.id where u.user_name =$1 ", [username], async (error, results) => {
            if (results.rowCount == 0 || !(await bcrpytjs.compare(password, results.rows[0]['user_password']))) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Password y/o Username son invalidos"
                });
            }
            if( !results.rows[0]['active'] ){
                console.log(results.rows[0]['active'] )
                return res.status(401).send({
                    message: "Perfil deshabilitado"
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
        const accessToken = req.header('Authorization');
        const { userId } = req.query

        if (!accessToken) {
            return res.status(403).json({ 'message': 'No token' });
        }
        const foundUser = await pool.query("SELECT u.id,u.id_role from users u where u.id = $1", [userId])
        const userRole = (foundUser.rows[0].id_role)

        const decoded = await promisify(jwt.verify)(accessToken, process.env.TOKEN_SECRET)

        if (decoded)
            res.status(200).send({
                'message': 'Valid Token',
                'userRole': userRole,
            })
        else {
            res.status(400).send({
                'message': 'Not Valid Token'
            })
        }

    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            // Handle expired token here
            return res.status(401).json({ message: 'Token has expired' });
        } else {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = { login, isAuth }
