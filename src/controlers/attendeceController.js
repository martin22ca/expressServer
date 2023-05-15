const jwt = require('jsonwebtoken');
//netifly

const { checkAuth } = require("../plugins/auth")

const pool = require('../db')
pool.connect();

const viewAttendeceToday = async (req, res, next) => {
    try {
        const { accessToken, classId, attDate } = req.query;

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

        const Attquery = "SELECT a.id as id_att ,s.id as id_stud, pd.first_name, pd.last_name, a.present,a.late, a.time_arrival, a.img_encoded,sc.status " +
            "from student_class sc  " +
            "INNER JOIN students s ON sc.id = s.id_student_class " +
            "INNER JOIN personal_data pd ON s.id_personal = pd.id " +
            "left join attendances a on a.id_student = s.id  and a.att_date = $1 " +
            "where sc.id = $2 "

        const attendances = await pool.query(Attquery, [attDate, classId])

        let attendancesRows = attendances.rows
        let status = true

        for (row in attendancesRows) {
            const timeEntry = attendancesRows[row].time_arrival
            const imgBuffer = attendancesRows[row].img_encoded
            const present = attendancesRows[row].present

            if (imgBuffer != null) {
                attendancesRows[row].img_encoded = Buffer.from(imgBuffer).toString('base64')
            }
            if (timeEntry != null) {
                const words = timeEntry.split(':');
                attendancesRows[row].time_arrival = words[0] + ":" + words[1]
            }
            if (present == null) {
                attendancesRows[row].present = false
                attendancesRows[row].late = false
            }
        }
        if (attendancesRows[0] != undefined) {
            status = attendancesRows[0].status
        }

        res.status(200).send({
            attendancesRows,
            status
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

const editAttendance = async (req, res, next) => {
    try {
        const { accessToken, idRollCall, idAtt, idStud, timeArrival, present, late } = req.body;

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
        if (idAtt == null) {
            const att = await pool.query("insert into attendances (id_student,id_roll_call,time_arrival,present,late) values ($1,$2,$3,$4,$5)",
                [idStud, idRollCall, timeArrival, present, late])
        } else {
            const att = await pool.query("update attendances set present = $1, late =$2, time_arrival =$3 where id =$4",
                [present, late, timeArrival, idAtt])
        }
        res.status(200).send({
            "message": "ok"
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

module.exports = { viewAttendeceToday, editAttendance }