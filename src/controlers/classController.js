const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const { checkAuth } = require("../plugins/auth")

const pool = require('../db')
pool.connect();

const homeClasses = async (req, res) => {
    try {
        const { accessToken, userId } = req.query;

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

        const queryAtt = "SELECT sc.id as sc,sc.school_year,sc.school_section ,sum(case a.present when true then 1 else 0 end) as present,count(s.id) as total " +
            "FROM student_class sc inner join students s on s.id_student_class = sc.id " +
            "left join attendences a on a.id_student = s.id and a.att_date  = $1 " +
            "where sc.id_employee = $2 group by sc.id ORDER BY school_year desc"

        const foundClasses = await pool.query(queryAtt, [currentDate, userId,])
        var schoolClasses = foundClasses.rows

        res.status(200).send({
            schoolClasses
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

const getClasses = async (req, res) => {
    try {
        const { accessToken, userId } = req.query;

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
        const queryAtt = "select id as sc, school_year ,school_section,status  from student_class sc where id_employee =$1"

        const schoolClassesQ = await pool.query(queryAtt, [userId])
        var schoolClasses = schoolClassesQ.rows
        var classObjs = {}

        for (idx in schoolClasses) {
            schoolClasses[idx].text = schoolClasses[idx].school_year + ' - "' + schoolClasses[idx].school_section + '"'
            classObjs[schoolClasses[idx].sc] = schoolClasses[idx]
        }

        res.status(200).send({
            classObjs
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

const classInfo = async (req, res) => {
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
        const queryAtt = "select dt.id_stud,pd.dni,pd.first_name ,pd.last_name,present,missing,late,total " +
            "from personal_data pd inner join (SELECT s.id as id_stud ,s.id_personal as id_pd,sum(case a.present when true then 1 else 0 end) as present ,sum(case a.present when true then 0 else 1 end) as missing ,sum(case a.late when true then 1 else 0 end) as late,  count(a.id) as total " +
            "FROM students s " +
            "inner join student_class sc on s.id_student_class = sc.id " +
            "left join attendences a on a.id_student = s.id " +
            "where sc.id = $1 " +
            "group by s.id )dt on pd.id = dt.id_pd"

        const classInfoQ = await pool.query(queryAtt, [classId])

        var classInfo = classInfoQ.rows

        res.status(200).send({
            classInfo,
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


module.exports = { homeClasses, getClasses, classInfo }