const bcrpytjs = require("bcryptjs")
const pool = require('../db.js')
pool.connect();
const getUsers = async (req, res) => {
    try {
        const queryAtt = "select u.id as id_user, u.user_name, pd.first_name ,r.id as id_role,r.value ,pd.last_name, pd.dni ,pd.email, u.active from users u " +
            "inner join personal_data pd  on pd.id  = u.id_personal " +
            "inner join roles r on u.id_role = r.id where r.id != 0 "
        const usersQ = await pool.query(queryAtt)

        const users = usersQ.rows

        res.status(200).send({
            users,
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
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, dni, username, password, email, role } = req.body;

        const existingDNI = await pool.query("SELECT * FROM personal_data WHERE dni = $1", [dni]);
        if (existingDNI.rowCount > 0) { return res.status(400).json({ 'message': 'DNI ya registrado.' }); }

        const existingUsername = await pool.query("SELECT * FROM users WHERE user_name = $1", [username]);
        if (existingUsername.rowCount > 0) { return res.status(400).json({ 'message': 'Username already exists in the database.' }); }

        const createRecog = await pool.query("insert into recognition (id_state)  values (0) RETURNING ID");
        const idRecog = createRecog.rows[0]['id']

        let query = "INSERT INTO personal_data ( id_recog,first_name, last_name, dni,email) VALUES ($1, $2, $3, $4,$5) RETURNING id";
        const values = [idRecog, firstName, lastName, dni, email];

        const createPersonal = await pool.query(query, values)
        const personalId = createPersonal.rows[0]['id']

        const hashedPassword = await bcrpytjs.hash(password, 8)

        await pool.query("INSERT INTO users (id_personal,id_role,user_name,user_password) VALUES ($1, $2, $3, $4)",
            [personalId, role, username, hashedPassword])

    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'Error in database creation.' });
    }
    res.sendStatus(200)
}
const getUserRole = async (req, res) => {
    try {
        const { role } = req.query;

        const queryAtt = "select u.id as id_user, u.user_name , u.id_role , pd.first_name ,pd.last_name,concat(pd.first_name,' ',pd.last_name)  as title " +
            "from users u inner join personal_data pd on pd.id  = u.id_personal " +
            "where u.id_role = $1 AND u.active = true order by title asc"

        const userRoleQ = await pool.query(queryAtt, [role])
        const userRoles = userRoleQ.rows

        res.status(200).send({
            userRoles,
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
const chageStateUser = async (req, res) => {
    try {
        const { idUser, status } = req.query;
        await pool.query("UPDATE users set active = $1 WHERE id = $2", [status, idUser])
        return res.status(200).json({ 'message': 'Cambio de estado del Usuario' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database deletion.' });
    }
}
const removeUser = async (req, res) => {
    try {
        const { idUser } = req.query;

        const persQ = (await pool.query("select id_personal from users u where id = $1 ", [idUser]))
        const idPersonal = persQ.rows[0].id_personal

        const recogQ = (await pool.query("select id_recog from personal_data pd where id = $1  ", [idPersonal]))
        const idRecoq = recogQ.rows[0].id_recog

        await pool.query("delete from users where users.id = $1", [idUser])
        await pool.query("delete from personal_data where personal_data.id = $1", [idPersonal])
        await pool.query("delete from recognition  where recognition.id = $1", [idRecoq])

        return res.status(200).json({ 'message': 'Usuario Elimado' });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database deletion.' });
    }
}
const updateUser = async (req, res) => {
    try {
        const { idUser, firstName, lastName, dni, username, password, email, role } = req.body;

        const checkDNI = await pool.query("select * from personal_data pd where pd.dni = $1 and pd.id != (select id_personal from users u where id = $2)", [dni, idUser])
        if (checkDNI.rowCount > 0) return res.status(400).json({ 'message': 'DNI ya existe en la base de datos.' });

        const checkusername = await pool.query("select * from users u where user_name = $1 and id != $2", [username, idUser])
        if (checkusername.rowCount > 0) return res.status(400).json({ 'message': 'Username ya existe en la base de datos.' });

        await pool.query("update personal_data set dni = $1, first_name = $2, last_name = $3, email = $4 where id  = (select id_personal from users u where id = $5)", [dni, firstName, lastName, email, idUser])

        if (password == null) {
            await pool.query("update users u set user_name = $1, id_role =$2 where id = $3", [username, role, idUser])
        }
        else {
            const passHas = await bcrpytjs.hash(password, 8)
            await pool.query("update users u set user_name = $1, id_role =$2, user_password = $3 where id = $4", [username, role, passHas, idUser])
        }
        return res.status(200).json({ 'message': 'Actualizado info del usuario con exito!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'Error in database Update.' });
    }
}

module.exports = { getUsers, chageStateUser, registerUser, getUserRole, removeUser, updateUser }