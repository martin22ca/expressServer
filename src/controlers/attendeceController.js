const jwt = require('jsonwebtoken');
//netifly

const { checkAuth } = require("../plugins/auth")

const pool = require('../db')
pool.connect();

const viewAttendeceToday = async (req, res, next) => {
    try {
        const { accessToken, classId } = req.query;

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
        const date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        const currentDate = `${day}-${month}-${year}`

        const Attquery = "SELECT a.id as id_att ,s.id as id_stud, pd.first_name, pd.last_name, a.present,a.late, a.time_arrival, a.img_encoded,sc.status " +
            "from student_class sc  " +
            "INNER JOIN students s ON sc.id = s.id_student_class " +
            "INNER JOIN personal_data pd ON s.id_personal = pd.id " +
            "left join attendences a on a.id_student = s.id  and a.att_date = $1 " +
            "where sc.id = $2 "

        const attendences = await pool.query(Attquery, [currentDate, classId])

        var attendencesRows = attendences.rows

        for (row in attendencesRows) {
            const timeEntry = attendencesRows[row].time_arrival
            const imgBuffer = attendencesRows[row].img_encoded
            const present = attendencesRows[row].present

            if (imgBuffer != null) {
                attendencesRows[row].img_encoded = Buffer.from(imgBuffer).toString('base64')
            }
            if (timeEntry != null) {
                const words = timeEntry.split(':');
                attendencesRows[row].time_arrival = words[0] + ":" + words[1]
            }
            if (present == null) {
                attendencesRows[row].present = false
                attendencesRows[row].late = false
            }
        }
        const status = attendencesRows[0].status
        res.status(200).send({
            attendencesRows,
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
            const att = await pool.query("insert into attendences (id_student,id_roll_call,time_arrival,present,late) values ($1,$2,$3,$4,$5)",
                [idStud, idRollCall, timeArrival, present, late])
        } else {
            const att = await pool.query("update attendences set present = $1, late =$2, time_arrival =$3 where id =$4",
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