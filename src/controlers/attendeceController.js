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
        let month = date.getMonth()+1;
        let year = date.getFullYear();
        
        let currentDate = `${day}-${month}-${year}`

        const rolls = await pool.query("select id  from roll_call where id_student_class = $1 and roll_date = $2",
        [classId,currentDate])
        if (rolls.rows[0].id){
            
        }

        const students = await pool.query("select students.id ,personal_data.first_name ,personal_data.last_name from students inner join personal_data on students.id_personal = personal_data.id where students.id_student_class = $1",
            [classId])

        console.log(students.rows)

        res.status(200).send({
            "message": "message is deleted"

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
module.exports = { viewAttendeceToday }