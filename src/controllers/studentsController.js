const pool = require('../db');
pool.connect();

const getStudents = async (req, res) => {
    try {
        const { idGrade } = req.query;
        const studentsQ = await pool.query("select s.id as id_stud,s.id_grade,s.school_number,pd.first_name,pd.last_name,pd.dni,pd.email,as2.value, as2.id as recog,as2.description, as2.color " +
            "from students s inner join personal_data pd on s.id_personal = pd.id " +
            "inner join recognition r on pd.id_recog = r.id  " +
            "inner join ai_states as2 on r.id_state = as2.id " +
            "where s.id_grade  =$1", [idGrade])
        const students = studentsQ.rows
        res.status(200).send({
            students
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

const registerStudent = async (req, res) => {
    try {
        const { school_number, firstName, lastName, dni, email, idGrade } = req.body;

        const checkDNI = await pool.query("select * from personal_data pd where pd.dni = $1", [dni])
        if (checkDNI.rowCount > 0) return res.status(400).json({ 'message': 'DNI ya existe en la base de datos.' });

        const createRecog = await pool.query("insert into recognition (id_state) values (0) RETURNING ID");
        const idRecog = createRecog.rows[0]['id']

        const query = "INSERT INTO personal_data ( id_recog,first_name, last_name, dni,email) VALUES ($1, $2, $3, $4,$5) RETURNING id";
        const values = [idRecog, firstName, lastName, dni, email];

        const createPersonal = await pool.query(query, values)
        const personalId = createPersonal.rows[0]['id']

        await pool.query("insert into students (id_personal,id_grade,school_number) values ($1,$2,$3)", [personalId, idGrade, school_number])

        res.status(200).send({
            "message": "Nuevo Estudiante Creado",
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
const removeStudent = async (req, res) => {
    try {
        const { idStud } = req.query;

        const persQ = (await pool.query("select id_personal from students where id= $1 ", [idStud]))
        const idPersonal = persQ.rows[0].id_personal

        const recogQ = (await pool.query("select id_recog from personal_data pd where id = $1  ", [idPersonal]))
        const idRecoq = recogQ.rows[0].id_recog

        await pool.query("delete from students where id = $1", [idStud])
        await pool.query("delete from personal_data where personal_data.id = $1", [idPersonal])
        await pool.query("delete from recognition  where recognition.id = $1", [idRecoq])

        return res.status(200).json({ 'message': 'Estudiante Elimado!' });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database deletion.' });
    }
}


const updateStudent = async (req, res) => {
    try {
        const { idStud, idGrade, firstName, lastName, dni, email } = req.body;

        const checkDNI = await pool.query("select dni from personal_data pd where pd.dni = $1 and pd.id != (select id_personal from students where id = $2)", [dni, idStud])
        if (checkDNI.rowCount > 0) return res.status(400).json({ 'message': 'DNI ya existe en la base de datos.' });

        await pool.query("update personal_data set dni = $1, first_name = $2, last_name = $3, email = $4 where id  = (select id_personal from students where id = $5)", [dni, firstName, lastName, email, idStud])
        await pool.query("update students  set id_grade = $1 where id = $2", [idGrade, idStud])

        return res.status(200).json({ 'message': 'Actualizado info del Estudiante con exito!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'Error in database Update.' });
    }
}

const removeAi = async (req, res) => {
    const { idStud } = req.body;
    await pool.query("update recognition set id_state = 0,encodings =null where id = (select r.id from students s inner join personal_data pd on pd.id = s.id_personal " +
        "inner join recognition r on r.id = pd.id_recog where s.id = $1)", [idStud])

    res.status(200).send({
        message: 'Files deleted',
    });
}

module.exports = { getStudents, registerStudent, updateStudent, removeStudent, removeAi }