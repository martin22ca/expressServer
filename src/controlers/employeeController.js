const bcrpytjs = require("bcryptjs")

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
            "from employees e inner join personal_data pd  on pd.id  = e.id_personal " +
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
const removeEmployee = async (req, res) => {
    try {
        const { accessToken, idEmp } = req.query;

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

        const removeClass = await pool.query("delete from personal_data where id = (select id_personal  from employees e where id =$1)", [idEmp])
        console.log(req.query)
        return res.status(200).json({ 'message': 'Empleado Elimado!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database deletion.' });
    }
}
const updateEmployee = async (req, res) => {
    try {
        const {accessToken, id_emp, firstName, lastName, dni, username, password, email, role } = req.body;

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

        const checkDNI = await pool.query("select * from personal_data pd where pd.dni = $1 and pd.id != (select id_personal from employees e where id = $2)", [dni,id_emp])
        if (checkDNI.rowCount > 0) return res.status(400).json({ 'message': 'DNI ya existe en la base de datos.' });

        const checkusername = await pool.query("select * from employees e where user_name = $1 and id != $2", [username,id_emp])
        if (checkusername.rowCount > 0) return res.status(400).json({ 'message': 'Username ya existe en la base de datos.' });

        const updatePersonal = await pool.query("update personal_data set dni = $1, first_name = $2, last_name = $3, email = $4 where id  = (select id_personal  from employees e where id = $5)", [dni, firstName, lastName, email, id_emp])

        if (password == null) {
            const updatePersonal = await pool.query("update employees set user_name = $1, id_role =$2 where id = $3", [username, role, id_emp])
        }
        else {
            let passHas = await bcrpytjs.hash(password, 8)
            const updatePersonal = await pool.query("update employees set user_name = $1, id_role =$2, user_pass  = $3 where id = $4", [username, role, passHas, id_emp])

        }
        return res.status(200).json({ 'message': 'Actualizado info del empleado con exito!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'Error in database Update.' });
    }
}

module.exports = { getEmployees, removeEmployee,updateEmployee }