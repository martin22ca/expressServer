const fs = require('fs');
const os = require('os')
const path = require('path');

const { checkAuth } = require("../plugins/auth")

const pool = require('../db')
pool.connect();

const getStudents = async (req, res) => {
    try {
        const { accessToken, idClass } = req.query;

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
        const studentsQ = await pool.query("select s.id as id_stud,s.id_student_class as id_cls,pd.first_name,pd.last_name,pd.dni,pd.email,r.id_status  from students s inner join personal_data pd on s.id_personal = pd.id left join ai_data r on s.id_data = r.id  where s.id_student_class =$1", [idClass])
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
        const { accessToken, firstName, lastName, dni, email, idClass } = req.body;

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
        var query = "INSERT INTO personal_data (first_name,last_name ,dni,email) VALUES ($1, $2, $3, $4) RETURNING ID"
        var eleme = [firstName, lastName, dni, email]

        const checkDNI = await pool.query("select * from personal_data pd where pd.dni = $1", [dni])
        if (checkDNI.rowCount > 0) return res.status(400).json({ 'message': 'DNI ya existe en la base de datos.' });

        const createPersonal = await pool.query(query, eleme)
        const personalId = createPersonal.rows[0]['id']

        const createStudent = await pool.query("insert into students (id_personal,id_student_class) values ($1,$2)", [personalId, idClass])

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
        const { accessToken, idStud } = req.query;

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

        const remove = await pool.query("delete from personal_data where id = (select id_personal from students where id =$1)", [idStud])
        console.log(req.query)
        return res.status(200).json({ 'message': 'Estudiante Elimado!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'error in database deletion.' });
    }
}


const updateStudent = async (req, res) => {
    try {
        const { accessToken, idStud, idCls, firstName, lastName, dni, email } = req.body;

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

        const checkDNI = await pool.query("select * from personal_data pd where pd.dni = $1 and pd.id != (select id_personal  from students where id = $2)", [dni, idStud])
        if (checkDNI.rowCount > 0) return res.status(400).json({ 'message': 'DNI ya existe en la base de datos.' });

        const updatePersonal = await pool.query("update personal_data set dni = $1, first_name = $2, last_name = $3, email = $4 where id  = (select id_personal  from students where id = $5)", [dni, firstName, lastName, email, idStud])
        const updateStud = await pool.query("update students  set id_student_class = $1 where id = $2", [idCls, idStud])

        return res.status(200).json({ 'message': 'Actualizado info del Estudiante con exito!' });


    } catch (error) {
        console.log(error)
        return res.status(400).json({ 'message': 'Error in database Update.' });
    }
}
const clean = async (req, res) => {
    const { accessToken, idStud } = req.body;
    const working = 2

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
    const homeDir = os.homedir();
    const uploadsDir = path.join(homeDir, 'students', idStud.toString());
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    } else {
        // Delete all items in the directory
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
            fs.unlinkSync(path.join(uploadsDir, file));
        }
    }
    const idRecogQ = await pool.query("select id_data from students s where id = $1", [idStud])
    const idRecog = idRecogQ.rows[0].idRecog
    if (idRecog != null) {
        const upRecog = await pool.query("update ai_data set id_status = $1 ,img_folder = $2 where id = $3", [working, uploadsDir, idRecog])
    } else {
        const idRecogQ2 = await pool.query("insert into ai_data (id_status,img_folder) values ($1,$2) returning ID", [working, uploadsDir])
        const upStud = await pool.query("update students set id_data = $1 where id = $2", [idRecogQ2.rows[0].id, idStud])
    }
    res.status(200).json({ 'message': 'Limpio!' });
}

const setUpAi = async (req, res) => {
    const { accessToken, idStud } = req.body;

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
    const baseData = req.body.image.replace(/^data:image\/jpeg;base64,/, '');
    const decodedImage = Buffer.from(baseData, 'base64');
    const homeDir = os.homedir();
    const uploadsDir = path.join(homeDir, 'students', idStud.toString());
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = path.join(uploadsDir, `${idStud}-${Date.now()}.jpg`);

    fs.writeFile(filename, decodedImage, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send({
                'message': 'Error saving image to file system'
            });
        } else {
            res.status(200).json({ 'message': 'Actualizado info del Estudiante con exito!' });
            return
        }
    });
}

const removeAi = async (req, res) => {
    const { accessToken, idStud } = req.body;

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
    const homeDir = os.homedir();
    const uploadsDir = path.join(homeDir, 'students', idStud.toString());

    const upRecog = await pool.query("delete from ai_data where id = (select id_data from students s where id = $1)  ", [idStud])

    if (fs.existsSync(uploadsDir)) {
        fs.readdir(uploadsDir, (err, files) => {
            if (err) {
                res.status(500).send({
                    message: 'Failed to read directory',
                });
                return null;
            }

            files.forEach((file) => {
                const filePath = path.join(uploadsDir, file);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log(`Failed to delete ${filePath}: ${err}`);
                    } else {
                        console.log(`Deleted ${filePath}`);
                    }
                });
            });

            res.status(200).send({
                message: 'All files deleted',
            });
        });
    } else {
        res.status(404).send({
            message: 'Directory does not exist',
        });
    }
}

module.exports = { getStudents, registerStudent, updateStudent, removeStudent, setUpAi, removeAi, clean }