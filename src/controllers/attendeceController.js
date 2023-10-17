const jwt = require('jsonwebtoken');
const { checkAuth } = require("../middlewares/auth.js")

const pool = require('../db')
pool.connect();

const viewAttendaceToday = async (req, res, next) => {
    try {
        const { idGrade, attDate } = req.query;

        const Attquery = "SELECT a.id as id_att ,s.id as id_stud, pd.first_name, pd.last_name, a.present, a.late, " +
            "a.arrival,a.img_encoded ,a.certainty, a.id_module, a.observation ,s.school_number,am.module_number " +
            "from grade g " +
            "inner join students s on s.id_grade = g.id " +
            "INNER JOIN personal_data pd ON s.id_personal = pd.id " +
            "inner join recognition r on r.id = pd.id_recog " +
            " left join attendances a on a.id_recog = r.id  and a.att_date = $1 " +
            "left join ai_modules am ON a.id_module = am.id " +
            " where s.id_grade = $2 "
        const attendancesQ = await pool.query(Attquery, [attDate, idGrade])

        const attendances = attendancesQ.rows

        for (row in attendances) {
            const timeEntry = attendances[row].time_arrival
            const imgBuffer = attendances[row].img_encoded
            const present = attendances[row].present

            if (imgBuffer != null) {
                attendances[row].img_encoded = Buffer.from(imgBuffer).toString('base64')
            }
            if (timeEntry != null) {
                const words = timeEntry.split(':');
                attendances[row].time_arrival = words[0] + ":" + words[1]
            }
            if (present == null) {
                attendances[row].present = false
                attendances[row].late = false
            }
        }
        res.status(200).send({
            attendances
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
        const { idAtt, idStud, attDate, arrival, present, late, observation } = req.body;

        const persQ = (await pool.query("select id_personal from students where id = $1 ", [idStud]))
        const idPersonal = persQ.rows[0].id_personal

        const recogQ = (await pool.query("select id_recog from personal_data pd where id = $1  ", [idPersonal]))
        const idRecoq = recogQ.rows[0].id_recog

        if (idAtt == null) {
            await pool.query("insert into attendances(id_recog,arrival,present,late,att_date ,observation ,certainty) values ($1,$2,$3,$4,$5,$6,0)",
                [idRecoq, arrival, present, late, attDate, observation])
        } else {
            await pool.query("update attendances set present = $1, late =$2, arrival =$3, observation = $4 where id =$5",
                [present, late, arrival, observation, idAtt])
        }
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

const delAttendance = async (req, res, next) => {
    try {
        const { id_att } = req.query;

        const att = await pool.query("delete from attendances where id =$1", [id_att])

        res.status(200).send({
            "message": "Asistencias Eliminada"
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

module.exports = { viewAttendaceToday, updateAttendance, delAttendance }