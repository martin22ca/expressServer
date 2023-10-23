const pool = require('../db')
pool.connect();

const viewAttendaceToday = async (req, res, next) => {
    try {
        const { idGrade, attDate } = req.query;
        const rollCall = await getRollCall(idGrade, attDate)

        const Attquery = "SELECT a.id as id_att ,s.id as id_stud, pd.first_name, pd.last_name, a.present, " +
            " a.late,a.arrival,a.img_encoded ,a.certainty, a.observation ,s.school_number " +
            "from students s " +
            "inner join personal_data pd ON s.id_personal = pd.id " +
            "inner join recognition r on pd.id_recog = r.id " +
            "inner join attendances a on a.id_recog = r.id " +
            "inner join roll_call rc on a.id_roll = rc.id " +
            "where rc.id = $1"
        const attendancesQ = await pool.query(Attquery, [rollCall.id])
        const attendances = attendancesQ.rows

        res.status(200).send({
            "attendances": attendances,
            "rollCall": rollCall
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

const updateAttendance = async (req, res, next) => {
    try {
        const { idAtt, arrival, present, late, observation } = req.body;

        await pool.query("update attendances set present = $1, late =$2, arrival =$3, observation = $4, certainty = 0 where id =$5",
            [present, late, arrival, observation, idAtt])

        res.status(200).send({
            "message": "Asistencias Actualizadas"
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

const closeAttendance = async (req, res, next) => {
    try {
        const { idRoll, idUser, observation } = req.query;

        const today = new Date();
        const now = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        const closeUser = await pool.query(
            "select concat(pd.first_name,' ',pd.last_name) as title  from  users u " +
            "inner join personal_data pd ON u.id_personal = pd.id where u.id = $1 ", [idUser])
        const closeSignature = '\n' + '-- Cerrado por: ' + closeUser.rows[0].title

        const attendances = await pool.query("select * from attendances a where a.id_roll = $1", [idRoll])
        const newRoll = await pool.query("update roll_call set status =false ,close_time = $1, observation = $2 where id = $3 returning *", [now, observation + closeSignature, idRoll])

        res.status(200).send({
            "newRoll": newRoll,
            "message": "Asistencias Cerradas"
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

async function getRollCall(idGrade, attDate) {
    try {
        let rollCall
        const rollCallQ = await pool.query("select * from roll_call rc where rc.id_grade = $1 and rc.att_date = $2", [idGrade, attDate])
        if (rollCallQ.rowCount > 0) {
            rollCall = rollCallQ.rows[0]
            await checkMissing(idGrade, rollCall.id)
        } else {
            const rollCallInsQ = await pool.query("insert into roll_call (id_grade,att_date) values ($1,$2) RETURNING *", [idGrade, attDate])
            rollCall = rollCallInsQ.rows[0]
            await setupRoll(idGrade, rollCall.id)
        }

        return rollCall
    } catch (error) {
        console.log(error)
    }
}

async function checkMissing(idGrade, idRoll) {
    try {
        const studentsQ = await pool.query("SELECT r.id " +
            "FROM students s " +
            "INNER JOIN personal_data pd ON s.id_personal = pd.id " +
            "INNER JOIN recognition r ON pd.id_recog = r.id " +
            "WHERE s.id_grade = $1 " +
            "AND r.id NOT IN (SELECT a.id_recog  FROM attendances a WHERE a.id_roll = $2)",
            [idGrade, idRoll])
        if (studentsQ.rowCount > 0) await fillAttendances(studentsQ.rows, idRoll)
        else return

    } catch (error) {
        console.log(error)
    }

}

async function setupRoll(idGrade, idRoll) {
    try {
        const students = (await pool.query("select r.id from students s " +
            " inner join personal_data pd ON s.id_personal = pd.id " +
            " inner join recognition r on pd.id_recog = r.id " +
            " where id_grade = $1", [idGrade])).rows
        await fillAttendances(students, idRoll)
        return
    } catch (error) {

    }
}

async function fillAttendances(students, idRoll) {
    try {
        for (const row of students) {
            await pool.query("insert into attendances (id_recog,id_roll) values ($1,$2)", [row.id, idRoll])
        }
    } catch (error) {

    }
}

module.exports = { viewAttendaceToday, updateAttendance, closeAttendance }