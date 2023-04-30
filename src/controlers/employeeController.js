const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const { checkAuth } = require("../plugins/auth")

const pool = require('../db')
pool.connect();

const getEmployees = async (req, res) => {
    try {
        const { accessToken } = req.query;

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

        const queryAtt = "select e.id as id_emp, e.user_name, e.id_role, pd.first_name ,pd.last_name, pd.dni ,pd.email " +
            "from employees e inner join personal_data pd  on pd.id  = e.id_personal_data " +
            " where pd.id != 0"

        const empQ = await pool.query(queryAtt)

        var employeesInfo = empQ.rows

        res.status(200).send({
            "employeesInfo": employeesInfo,
        });
        return null


    }
    catch (error) {
        console.log(error)
        res.status(403).send({
            'message': 'Server Error'
        })
    }
}


module.exports = { getEmployees }